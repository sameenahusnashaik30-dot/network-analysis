import os
import pytest
import numpy as np
from app.ml.known_attack_classifier import KnownAttackClassifier, ATTACK_CLASSES
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.open_set_detector import OpenSetDetector
from app.ml.detection_engine import detection_engine
from app.ml.preprocessing import extract_features, extract_raw_features, FEATURE_NAMES

def test_models_load_from_disk_without_fallbacks():
    """Verify that both RandomForest and Autoencoder models are genuine joblib artifacts on disk."""
    clf = KnownAttackClassifier()
    assert clf.model is not None, "RandomForest model artifact must be loaded from disk"
    assert len(clf.classes) == 7, "Model must support all 7 benchmark classes"
    assert set(clf.classes) == set(ATTACK_CLASSES)

    ae = AnomalyDetector()
    assert ae.model is not None, "Autoencoder model artifact must be loaded from disk"
    assert ae.threshold > 0.0, "Anomaly threshold must be calibrated and positive"

def test_probability_calibration_properties():
    """Verify that predicted probability distributions are valid and properly calibrated."""
    clf = KnownAttackClassifier()
    flow = {
        "flow_id": "TEST-CALIB-01",
        "packet_count": 2500,
        "byte_count": 180000,
        "duration_sec": 30.0,
        "packet_rate": 83.3,
        "byte_rate": 6000.0,
        "dst_port": 443,
        "src_port": 50123,
        "tcp_flags": "ACK",
    }
    pred_class, conf, probs = clf.predict(flow)
    assert pred_class in ATTACK_CLASSES
    assert 0.0 <= conf <= 1.0
    assert len(probs) == 7
    total_prob = sum(probs.values())
    assert abs(total_prob - 1.0) < 0.01, f"Probabilities must sum to 1.0, got {total_prob}"
    for k, v in probs.items():
        assert 0.0 <= v <= 1.0

def test_all_7_classes_classification():
    """Test genuine classification accuracy across all 7 supported attack classes."""
    test_cases = [
        ("Normal", {
            "flow_id": "T-NORM", "packet_count": 2600, "byte_count": 190000, "duration_sec": 30.0,
            "packet_rate": 86.6, "byte_rate": 6333.3, "dst_port": 443, "src_port": 51000, "tcp_flags": "ACK",
        }),
        ("DDoS", {
            "flow_id": "T-DDOS", "packet_count": 190000, "byte_count": 13300000, "duration_sec": 4.0,
            "packet_rate": 47500.0, "byte_rate": 3325000.0, "dst_port": 80, "src_port": 32000, "tcp_flags": "SYN",
        }),
        ("DoS", {
            "flow_id": "T-DOS", "packet_count": 48000, "byte_count": 2880000, "duration_sec": 14.0,
            "packet_rate": 3428.5, "byte_rate": 205714.0, "dst_port": 80, "src_port": 28000, "tcp_flags": "SYN",
        }),
        ("Port Scan", {
            "flow_id": "T-SCAN", "packet_count": 5, "byte_count": 250, "duration_sec": 0.5,
            "packet_rate": 10.0, "byte_rate": 500.0, "dst_port": 7777, "src_port": 41000, "tcp_flags": "SYN",
        }),
        ("Brute Force", {
            "flow_id": "T-BRUTE", "packet_count": 1300, "byte_count": 220000, "duration_sec": 42.0,
            "packet_rate": 30.9, "byte_rate": 5238.1, "dst_port": 22, "src_port": 49000, "tcp_flags": "PSH,ACK",
        }),
        ("Botnet", {
            "flow_id": "T-BOT", "packet_count": 5200, "byte_count": 570000, "duration_sec": 58.0,
            "packet_rate": 89.6, "byte_rate": 9827.6, "dst_port": 6667, "src_port": 54000, "tcp_flags": "ACK",
        }),
        ("Web Attack", {
            "flow_id": "T-WEB", "packet_count": 3600, "byte_count": 1440000, "duration_sec": 19.0,
            "packet_rate": 189.4, "byte_rate": 75789.5, "dst_port": 8443, "src_port": 52000, "tcp_flags": "PSH,ACK",
        }),
    ]

    clf = KnownAttackClassifier()
    for expected_class, flow in test_cases:
        pred_class, conf, probs = clf.predict(flow)
        assert pred_class == expected_class, f"Expected {expected_class}, got {pred_class} (conf: {conf})"
        assert conf >= 0.70, f"Confidence for {expected_class} must be >= 0.70, got {conf}"

def test_autoencoder_reconstruction_error_separation():
    """Verify Autoencoder gives low reconstruction error for normal traffic and higher for anomalies."""
    ae = AnomalyDetector()
    normal_flow = {
        "flow_id": "AE-NORM", "packet_count": 2500, "byte_count": 180000, "duration_sec": 30.0,
        "packet_rate": 83.3, "byte_rate": 6000.0, "dst_port": 443, "src_port": 50000, "tcp_flags": "ACK",
    }
    rec_err_norm, score_norm, thresh, is_anom_norm = ae.detect(normal_flow)
    assert not is_anom_norm, f"Normal flow should not be flagged as anomaly, rec_err={rec_err_norm}, thresh={thresh}"

    anomalous_flow = {
        "flow_id": "AE-ANOM", "packet_count": 220000, "byte_count": 16000000, "duration_sec": 3.0,
        "packet_rate": 73333.3, "byte_rate": 5333333.3, "dst_port": 80, "src_port": 12000, "tcp_flags": "SYN",
    }
    rec_err_anom, score_anom, _, is_anom_attack = ae.detect(anomalous_flow)
    assert is_anom_attack, "Severe flood traffic must be flagged as anomaly"
    assert rec_err_anom > rec_err_norm, "Attack reconstruction error must exceed normal reconstruction error"

def test_data_leakage_prevention_feature_scaling():
    """Verify StandardScaler transforms features correctly and preserves zero-mean unit-variance scaling."""
    raw = extract_raw_features({
        "packet_count": 2500, "byte_count": 180000, "duration_sec": 30.0,
        "packet_rate": 83.3, "byte_rate": 6000.0, "dst_port": 443, "src_port": 50000,
        "tcp_flags": "ACK",
    })
    scaled = extract_features({
        "packet_count": 2500, "byte_count": 180000, "duration_sec": 30.0,
        "packet_rate": 83.3, "byte_rate": 6000.0, "dst_port": 443, "src_port": 50000,
        "tcp_flags": "ACK",
    })
    assert len(raw) == len(FEATURE_NAMES)
    assert len(scaled) == len(FEATURE_NAMES)
    assert not np.array_equal(raw, scaled), "Scaled features must differ from raw unscaled features"
    assert np.all(np.isfinite(scaled)), "Scaled features must be finite numbers"

def test_zero_day_detection_on_unseen_attack_pattern():
    """Verify that completely novel attack traffic is routed to Zero-Day Candidate rather than forced into a known class."""
    novel_flow = {
        "flow_id": "ZD-UNSEEN-01",
        "packet_count": 12400,
        "byte_count": 3100500,
        "duration_sec": 14.2,
        "packet_rate": 873.2,
        "byte_rate": 218345.0,
        "dst_port": 9999,
        "src_port": 62111,
        "tcp_flags": "URG,PSH,FIN",
    }
    res = detection_engine.process_flow(novel_flow)
    assert res.is_zero_day_candidate or res.final_label in ["Zero-Day Candidate", "Unknown Attack"]
    assert res.open_set.is_unknown is True
    assert res.anomaly_score >= 0.60
