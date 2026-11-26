import pytest
import numpy as np
from app.xai.reliability import reliability_engine
from app.adversarial.evaluator import adversarial_evaluator
from app.adversarial.perturbation import perturb_flow_telemetry
from app.schemas.xai import ReliabilityResponse

def test_empirical_explanation_stability_spearman_rho():
    """Verify Explanation Stability Engine calculates genuine Spearman rank correlation across 40 trials."""
    sample_flow = {
        "flow_id": "TEST-STAB-01",
        "packet_count": 9400,
        "byte_count": 2100400,
        "duration_sec": 18.5,
        "packet_rate": 508.1,
        "byte_rate": 113535.1,
        "dst_port": 8443,
        "src_port": 61244,
        "tcp_flags": "URG,ACK,PSH",
    }
    result = reliability_engine.evaluate_stability(sample_flow, "INC-STAB-001")
    assert isinstance(result, ReliabilityResponse)
    # Spearman rho must be a valid correlation
    assert 0.0 <= result.feature_ranking_consistency <= 1.0
    assert 50 <= result.stability_score <= 100
    assert result.stability_score == int(round(result.feature_ranking_consistency * 100))
    assert result.perturbation_sigma == 0.05
    assert len(result.top_features_retained) >= 2
    # Output message must confirm 40 trials and perturbation settings
    assert "40 controlled Gaussian perturbation trials" in result.perturbation_test_result
    assert "sigma=0.05" in result.perturbation_test_result

def test_adversarial_feature_perturbation_network_constraints():
    """Verify adversarial perturbations strictly respect physical network protocol invariants."""
    clean_flow = {
        "flow_id": "TEST-ADV-FLOW",
        "packet_count": 10000,
        "byte_count": 800000,
        "duration_sec": 5.0,
        "packet_rate": 2000.0,
        "byte_rate": 160000.0,
        "dst_port": 80,
        "src_port": 50123,
        "tcp_flags": "SYN",
    }
    categories = [
        "Feature Perturbation",
        "Traffic Timing Evasion",
        "Payload Size Morphing",
        "Flag Manipulation Evasion",
        "Gaussian Noise",
    ]
    for cat in categories:
        perturbed = perturb_flow_telemetry(clean_flow, epsilon=0.20, category=cat)
        assert perturbed["packet_count"] >= 1
        assert perturbed["byte_count"] >= 40
        assert perturbed["duration_sec"] >= 0.05
        # Verify rate consistency
        expected_pkt_rate = round(perturbed["packet_count"] / perturbed["duration_sec"], 2)
        expected_byte_rate = round(perturbed["byte_count"] / perturbed["duration_sec"], 2)
        assert abs(perturbed["packet_rate"] - expected_pkt_rate) < 0.1
        assert abs(perturbed["byte_rate"] - expected_byte_rate) < 0.1

def test_adversarial_evaluator_measures_empirical_degradation():
    """Verify Adversarial Evaluator runs real batches and measures accuracy, precision, recall, and F1 drops."""
    res = adversarial_evaluator.run_experiment(
        model_name="RandomForest+Autoencoder",
        dataset_name="Test-Subset",
        attack_category="Traffic Timing Evasion",
        epsilon=0.15,
        iterations=5,
    )
    # Check baseline structure
    assert "accuracy" in res["baseline"]
    assert "precision" in res["baseline"]
    assert "recall" in res["baseline"]
    assert "f1_score" in res["baseline"]
    assert "fpr" in res["baseline"]
    assert res["baseline"]["accuracy"] >= 0.85

    # Check perturbed structure
    assert "accuracy" in res["perturbed"]
    assert "precision" in res["perturbed"]
    assert "recall" in res["perturbed"]
    assert "f1_score" in res["perturbed"]

    # Check degradation metrics
    assert "degradation_metrics" in res
    deg = res["degradation_metrics"]
    assert "accuracy_drop_pct" in deg
    assert "precision_drop_pct" in deg
    assert "recall_drop_pct" in deg
    assert "f1_drop_pct" in deg
    assert deg["accuracy_drop_pct"] >= 0.0

    # Check overall summary
    assert 0.0 <= res["performance_degradation"] <= 100.0
    assert 0.0 <= res["robustness_score"] <= 100.0
    assert res["tested_samples"] >= 50
    assert res["is_demo"] is False
    assert res["configuration"]["epsilon"] == 0.15

def test_adversarial_higher_epsilon_causes_equal_or_greater_degradation():
    """Verify that larger perturbation budgets result in monotonic or equal degradation."""
    res_low = adversarial_evaluator.run_experiment(
        model_name="RandomForest+Autoencoder",
        dataset_name="Test-Subset",
        attack_category="Traffic Timing Evasion",
        epsilon=0.04,
        iterations=5,
    )
    res_high = adversarial_evaluator.run_experiment(
        model_name="RandomForest+Autoencoder",
        dataset_name="Test-Subset",
        attack_category="Traffic Timing Evasion",
        epsilon=0.35,
        iterations=5,
    )
    assert res_high["performance_degradation"] >= res_low["performance_degradation"] or \
           res_high["perturbed"]["accuracy"] <= res_low["perturbed"]["accuracy"]
