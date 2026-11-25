import pytest
from app.ml.known_attack_classifier import KnownAttackClassifier
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.open_set_detector import OpenSetDetector
from app.ml.detection_engine import detection_engine

def test_normal_traffic_detection():
    normal_flow = {
        "flow_id": "TEST-NORMAL-01",
        "packet_count": 2200,
        "byte_count": 160000,
        "duration_sec": 30.0,
        "packet_rate": 73.3,
        "byte_rate": 5333.3,
        "dst_port": 443,
        "src_port": 49200,
        "tcp_flags": "ACK",
    }
    result = detection_engine.process_flow(normal_flow)
    assert result.final_label == "Normal"
    assert result.anomaly_score < 0.60
    assert not result.is_zero_day_candidate

def test_known_ddos_detection():
    ddos_flow = {
        "flow_id": "TEST-DDOS-01",
        "packet_count": 200000,
        "byte_count": 14000000,
        "duration_sec": 4.0,
        "packet_rate": 50000.0,
        "byte_rate": 3500000.0,
        "dst_port": 80,
        "src_port": 51200,
        "tcp_flags": "SYN",
    }
    result = detection_engine.process_flow(ddos_flow)
    assert result.final_label == "DDoS"
    assert result.confidence > 0.65
    assert not result.is_zero_day_candidate

def test_open_set_zero_day_candidate_not_forced_to_known_class():
    """Critical PRD Requirement: Model must NOT force unfamiliar traffic into a known attack class."""
    zero_day_flow = {
        "flow_id": "TEST-ZERODAY-01",
        "packet_count": 9400,
        "byte_count": 2100400,
        "duration_sec": 18.5,
        "packet_rate": 508.1,
        "byte_rate": 113535.1,
        "dst_port": 8443,
        "src_port": 61244,
        "tcp_flags": "URG,ACK,PSH",
    }
    result = detection_engine.process_flow(zero_day_flow)
    # The system should flag it as Unknown Attack or Zero-Day Candidate
    assert result.open_set.is_unknown is True
    assert result.final_label in ["Unknown Attack", "Zero-Day Candidate"]
    assert result.anomaly_score >= 0.60
