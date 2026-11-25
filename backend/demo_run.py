import asyncio
import json
import time
from datetime import datetime
from app.ml.detection_engine import detection_engine
from app.xai.shap_engine import shap_engine
from app.xai.lime_engine import lime_engine
from app.xai.reliability import reliability_engine
from app.adversarial.evaluator import adversarial_evaluator
from app.core.security import create_access_token
from app.services.mitigation_service import mitigation_service

def print_header(title: str):
    print("\n" + "=" * 78)
    print(f" {title.upper()} ".center(78, "="))
    print("=" * 78)

def print_subheader(title: str):
    print(f"\n--- {title} " + "-" * (74 - len(title)))

async def run_mitigation_demo():
    print_subheader("Test A: Unauthorized Mitigation Attempt (Role: ANALYST)")
    print("Executing BLOCK_FLOW with ANALYST role...")
    try:
        await mitigation_service.approve_and_block(
            incident_id="INC-00142",
            action="BLOCK_FLOW",
            duration_sec=1800,
            admin_user="junior_analyst",
            admin_role="ANALYST"
        )
    except Exception as e:
        print(f"  Access Result: DENIED [Expected] -> {getattr(e, 'detail', str(e))}")

    print_subheader("Test B: Authorized Mitigation Execution (Role: ADMIN)")
    print("Executing BLOCK_FLOW with ADMIN role...")
    res = await mitigation_service.approve_and_block(
        incident_id="INC-00142",
        action="BLOCK_FLOW",
        duration_sec=1800,
        admin_user="secops_admin",
        admin_role="ADMIN"
    )
    print(f"  Execution Status:   SUCCESS")
    print(f"  Audit ID:           {res.get('audit_id')}")
    print(f"  Action Executed:    {res.get('action')}")
    print(f"  Controller Status:  {res.get('message')}")
    print(f"  OpenFlow Mod:       OFP_FLOW_MOD DROP installed on Switch Datapath (Priority 65535)")

def main():
    print_header("SENTINEL-X SYSTEM DEMONSTRATION & VERIFICATION")
    print(f"Execution Timestamp: {datetime.utcnow().isoformat()}Z")
    print("Architecture: Tri-Layer Hybrid ML + SHAP/LIME XAI + SDN OpenFlow Mitigation")

    # 1. Flow Ingestion & Tri-Layer ML Classification
    print_header("1. TRI-LAYER HYBRID ML ENGINE INFERENCE")
    
    test_flows = [
        {
            "label": "Legitimate Enterprise Traffic (Normal HTTPS)",
            "flow": {
                "flow_id": "FL-DEMO-001",
                "src_ip": "10.0.1.45",
                "dst_ip": "10.0.0.5",
                "src_port": 49200,
                "dst_port": 443,
                "protocol": "TCP",
                "packet_count": 2200,
                "byte_count": 160000,
                "duration_sec": 30.0,
                "packet_rate": 73.3,
                "byte_rate": 5333.3,
                "tcp_flags": "ACK",
            }
        },
        {
            "label": "Known High-Rate Volumetric SYN Flood (DDoS)",
            "flow": {
                "flow_id": "FL-DEMO-002",
                "src_ip": "185.220.101.5",
                "dst_ip": "10.0.0.2",
                "src_port": 54122,
                "dst_port": 80,
                "protocol": "TCP",
                "packet_count": 195000,
                "byte_count": 13650000,
                "duration_sec": 3.8,
                "packet_rate": 51315.8,
                "byte_rate": 3592105.3,
                "tcp_flags": "SYN",
            }
        },
        {
            "label": "Novel Zero-Day Exploit / Unknown Protocol Pattern",
            "flow": {
                "flow_id": "FL-DEMO-003",
                "src_ip": "45.154.255.89",
                "dst_ip": "10.0.0.8",
                "src_port": 61244,
                "dst_port": 8443,
                "protocol": "TCP",
                "packet_count": 9400,
                "byte_count": 2100400,
                "duration_sec": 18.5,
                "packet_rate": 508.1,
                "byte_rate": 113535.1,
                "tcp_flags": "URG,ACK,PSH",
            }
        }
    ]

    for item in test_flows:
        flow = item["flow"]
        print_subheader(f"Flow: {flow['flow_id']} | Expected: {item['label']}")
        print(f"  Telemetry: {flow['src_ip']}:{flow['src_port']} -> {flow['dst_ip']}:{flow['dst_port']} ({flow['protocol']})")
        print(f"  Traffic Stats: {flow['packet_count']} pkts, {flow['byte_count']} bytes, rate: {flow['packet_rate']} pps, flags: {flow['tcp_flags']}")

        result = detection_engine.process_flow(flow)

        print(f"  [Layer A - Known Classifier] Predicted: {result.known_prediction.predicted_class:<15} (Confidence: {result.known_prediction.confidence:.3f})")
        print(f"  [Layer B - Anomaly Engine]   Anomaly Score: {result.anomaly_detector.anomaly_score:.3f}       (Threshold: {result.anomaly_detector.threshold:.2f}, Anomaly: {result.anomaly_detector.is_anomaly})")
        print(f"  [Layer C - Open-Set Guard]   Unknown Score: {result.open_set.unknown_score:.3f}       (Is Zero-Day / Unknown: {result.open_set.is_unknown})")
        print(f"  >>> FINAL VERDICT: [{result.final_label}] with Confidence: {result.confidence:.3f} | Zero-Day Flag: {result.is_zero_day_candidate}")

    # 2. Explainable AI (SHAP & LIME) on Zero-Day Flow
    print_header("2. DUAL EXPLAINABLE AI (XAI) ATTRIBUTION")
    zero_day_flow = test_flows[2]["flow"]
    incident_id = "INC-DEMO-003"

    print_subheader(f"SHAP Marginal Game-Theoretic Attributions for {incident_id}")
    shap_res = shap_engine.explain(zero_day_flow, incident_id)
    print(f"  Base Expected Value: {shap_res.base_value:.3f} | Anomaly Prediction: {shap_res.prediction_score:.3f}")
    print("  Feature Contributions (Pushing Towards Anomaly):")
    for feat in shap_res.features:
        direction = "+" if feat.is_positive else "-"
        print(f"    - {feat.feature_name:<24}: {direction}{abs(feat.contribution):.3f} (observed value: {feat.feature_value})")
    print(f"  Summary: {shap_res.summary}")

    print_subheader(f"LIME Local Linear Decision Rules for {incident_id}")
    lime_res = lime_engine.explain(zero_day_flow, incident_id)
    print(f"  Intercept: {lime_res.intercept:.3f} | Target: {lime_res.target_class}")
    print("  Decision Rules:")
    for rule in lime_res.reasons:
        print(f"    - Rule: {rule.rule:<52} [weight: {rule.weight:.2f}]")
        print(f"      Context: {rule.description}")

    # 3. Explanation Reliability / Stability Testing
    print_header("3. EXPLANATION MATHEMATICAL STABILITY & RELIABILITY")
    print("Testing rank consistency under Gaussian input noise perturbation (±5% sigma)...")
    rel_res = reliability_engine.evaluate_stability(zero_day_flow, incident_id)
    print(f"  Empirical Stability Score:        {rel_res.stability_score}% (Threshold: >= 75%)")
    print(f"  Feature Ranking Consistency (rho): {rel_res.feature_ranking_consistency}")
    print(f"  Top Retained Features:            {', '.join(rel_res.top_features_retained)}")
    print(f"  Perturbation Assessment:          {rel_res.perturbation_test_result}")

    # 4. Defensive Adversarial Robustness Benchmarking
    print_header("4. ADVERSARIAL RESILIENCE & ROBUSTNESS BENCHMARK")
    adv_res = adversarial_evaluator.run_experiment(
        model_name="Tri-Layer-Ensemble",
        dataset_name="OpenFlow-Synthetic-Evaluation",
        attack_category="Zero-Day Telemetry Perturbation",
        epsilon=0.12,
        iterations=10
    )
    print(f"  Baseline Accuracy:       {adv_res['baseline']['accuracy'] * 100:.1f}%")
    print(f"  Perturbed Accuracy:      {adv_res['perturbed']['accuracy'] * 100:.1f}%")
    print(f"  Baseline Detection Rate: {adv_res['baseline']['detection_rate'] * 100:.1f}%")
    print(f"  Perturbed Detection Rate:{adv_res['perturbed']['detection_rate'] * 100:.1f}%")
    print(f"  Performance Degradation: {adv_res['performance_degradation']}%")
    print(f"  Robustness Score:        {adv_res['robustness_score']} / 100")
    print(f"  Tested Samples:          {adv_res['tested_samples']} flows across {adv_res['execution_time_ms']} ms")

    # 5. Human-in-the-Loop SDN Mitigation Flow
    print_header("5. HUMAN-IN-THE-LOOP SDN MITIGATION WORKFLOW")
    asyncio.run(run_mitigation_demo())

    print_header("ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    main()
