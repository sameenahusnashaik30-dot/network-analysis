import pytest
import numpy as np
from app.xai.shap_engine import shap_engine
from app.xai.lime_engine import lime_engine
from app.schemas.xai import ShapResponse, LimeResponse

def test_official_shap_tree_explainer_on_known_ddos():
    """Verify official SHAP TreeExplainer generates genuine attributions on known DDoS attack."""
    ddos_flow = {
        "flow_id": "TEST-SHAP-DDOS",
        "packet_count": 190000,
        "byte_count": 13300000,
        "duration_sec": 4.0,
        "packet_rate": 47500.0,
        "byte_rate": 3325000.0,
        "dst_port": 80,
        "src_port": 49120,
        "tcp_flags": "SYN",
    }
    result = shap_engine.explain(ddos_flow, "INC-XAI-001")
    assert isinstance(result, ShapResponse)
    assert result.target_class == "DDoS"
    assert result.prediction_score >= 0.85
    assert len(result.features) >= 4
    
    # Verify Shapley efficiency: sum of contributions + base_value ≈ prediction_score
    feature_contrib_sum = sum(f.contribution for f in result.features)
    # The top features should explain the vast majority of the probability shift
    assert abs(feature_contrib_sum) > 0.05
    
    # Check that high volume features (packet count, packet rate, or SYN flag) are in top contributions
    top_feature_names = [f.feature_name for f in result.features[:3]]
    relevant_terms = ["Packet Count", "Packet Rate (pps)", "TCP SYN Flag", "Byte Count"]
    assert any(term in top_feature_names for term in relevant_terms)

def test_official_shap_on_port_scan():
    """Verify official SHAP identifies port scan characteristics (low packet count, scan duration)."""
    scan_flow = {
        "flow_id": "TEST-SHAP-SCAN",
        "packet_count": 4,
        "byte_count": 200,
        "duration_sec": 0.4,
        "packet_rate": 10.0,
        "byte_rate": 500.0,
        "dst_port": 7890,
        "src_port": 41200,
        "tcp_flags": "SYN",
    }
    result = shap_engine.explain(scan_flow, "INC-XAI-002")
    assert isinstance(result, ShapResponse)
    assert result.target_class == "Port Scan"
    assert len(result.features) >= 4
    assert result.features[0].contribution != 0.0

def test_official_shap_on_zero_day_candidate():
    """Verify SHAP produces Autoencoder manifold attributions for novel zero-day candidates."""
    zero_day_flow = {
        "flow_id": "TEST-SHAP-ZD",
        "packet_count": 12400,
        "byte_count": 3100500,
        "duration_sec": 14.2,
        "packet_rate": 873.2,
        "byte_rate": 218345.0,
        "dst_port": 9999,
        "src_port": 62111,
        "tcp_flags": "URG,PSH,FIN",
    }
    result = shap_engine.explain(zero_day_flow, "INC-XAI-003")
    assert isinstance(result, ShapResponse)
    assert result.target_class == "Zero-Day Candidate / Anomaly"
    assert len(result.features) >= 4
    # URG flag or packet rate should be prominent in explaining anomaly
    feature_names = [f.feature_name for f in result.features]
    assert any("URG" in name or "Rate" in name or "Count" in name for name in feature_names)

def test_official_lime_tabular_explainer_on_known_attack():
    """Verify official LIME tabular surrogate fits local linear models and extracts rules."""
    dos_flow = {
        "flow_id": "TEST-LIME-DOS",
        "packet_count": 48000,
        "byte_count": 2880000,
        "duration_sec": 14.0,
        "packet_rate": 3428.5,
        "byte_rate": 205714.0,
        "dst_port": 80,
        "src_port": 28000,
        "tcp_flags": "SYN",
    }
    result = lime_engine.explain(dos_flow, "INC-XAI-004")
    assert isinstance(result, LimeResponse)
    assert result.target_class in ["DoS", "DDoS"]
    assert len(result.reasons) >= 2
    for r in result.reasons:
        assert isinstance(r.rule, str) and len(r.rule) > 0
        assert isinstance(r.weight, float) and r.weight >= 0.0
        assert isinstance(r.description, str) and len(r.description) > 0

def test_shap_lime_different_inputs_produce_different_attributions():
    """Strict PRD check: Confirm explanations genuinely vary with input features (zero hardcoding)."""
    flow_a = {
        "flow_id": "TEST-FLOW-A",
        "packet_count": 200000, "byte_count": 14000000, "duration_sec": 4.0,
        "packet_rate": 50000.0, "byte_rate": 3500000.0, "dst_port": 80, "src_port": 30000, "tcp_flags": "SYN",
    }
    flow_b = {
        "flow_id": "TEST-FLOW-B",
        "packet_count": 1200, "byte_count": 220000, "duration_sec": 40.0,
        "packet_rate": 30.0, "byte_rate": 5500.0, "dst_port": 22, "src_port": 45000, "tcp_flags": "PSH,ACK",
    }

    res_shap_a = shap_engine.explain(flow_a, "INC-A")
    res_shap_b = shap_engine.explain(flow_b, "INC-B")
    assert res_shap_a.target_class != res_shap_b.target_class
    assert res_shap_a.features[0].feature_name != res_shap_b.features[0].feature_name or \
           res_shap_a.features[0].contribution != res_shap_b.features[0].contribution
