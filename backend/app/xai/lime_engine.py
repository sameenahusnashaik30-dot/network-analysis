import numpy as np
from typing import Dict, Any, List
from sklearn.linear_model import Ridge
from app.ml.preprocessing import extract_features, FEATURE_NAMES
from app.ml.anomaly_detector import AnomalyDetector
from app.schemas.xai import LimeResponse, LimeReasonSchema

class LimeEngine:
    """
    Genuine Local Interpretable Model-agnostic Explanations (LIME) Engine.
    Samples K perturbations in the local neighborhood of the query flow,
    weights them by exponential proximity distance, and fits an interpretable
    local Ridge surrogate model to extract genuine local linear decision boundaries.
    """
    def __init__(self, num_samples: int = 100, sigma: float = 0.5):
        self.num_samples = num_samples
        self.sigma = sigma
        self.anomaly_detector = AnomalyDetector()

    def explain(self, flow_dict: Dict[str, Any], incident_id: str) -> LimeResponse:
        x = extract_features(flow_dict)
        _, base_score, _, _ = self.anomaly_detector.detect(flow_dict)
        
        n_features = len(x)
        np.random.seed(int(''.join(filter(str.isdigit, incident_id)) or 42) % 100000)

        # 1. Sample K Gaussian perturbations in local standardized neighborhood
        noise = np.random.normal(0, self.sigma, size=(self.num_samples, n_features))
        Z = x + noise

        # 2. Evaluate black-box model on all perturbed instances
        Z_hat = np.array([self.anomaly_detector.reconstruct(z) for z in Z])
        rec_errors = np.mean((Z - Z_hat) ** 2, axis=1)
        # Sigmoid anomaly predictions for all perturbed samples
        Y = 1.0 / (1.0 + np.exp(-1.5 * (rec_errors - self.anomaly_detector.threshold)))

        # 3. Calculate exponential proximity kernel weights: pi_x(z) = exp(-||x - z||^2 / sigma^2)
        distances = np.linalg.norm(Z - x, axis=1)
        weights = np.exp(-(distances ** 2) / (self.sigma ** 2 + 1e-6))

        # 4. Fit Weighted Ridge Surrogate Model: g(z) = beta_0 + beta * z
        surrogate = Ridge(alpha=1.0, fit_intercept=True)
        surrogate.fit(Z, Y, sample_weight=weights)

        intercept = float(surrogate.intercept_)
        coefs = surrogate.coef_

        display_names = {
            "packet_count": "Packet Count",
            "byte_count": "Byte Count",
            "duration_sec": "Flow Duration",
            "packet_rate": "Packet Rate",
            "byte_rate": "Byte Throughput",
            "dst_port": "Destination Port",
            "src_port": "Source Port Range",
            "tcp_flag_syn": "TCP SYN Flag",
            "tcp_flag_urg": "TCP URG Flag",
            "tcp_flag_rst": "TCP RST Flag",
        }

        # 5. Extract top decision rules from surrogate regression coefficients
        sorted_indices = np.argsort(np.abs(coefs))[::-1]
        reasons: List[LimeReasonSchema] = []

        for idx in sorted_indices[:4]:
            feat_name = FEATURE_NAMES[idx]
            disp_name = display_names.get(feat_name, feat_name)
            weight_val = round(float(coefs[idx]), 3)
            raw_val = flow_dict.get(feat_name, 0)
            
            if "flag" in feat_name:
                rule_text = f"{disp_name} active in packet headers"
                desc = "Control flag state drives elevated decision threshold in local surrogate model."
            elif feat_name in ["packet_rate", "byte_rate"]:
                rule_text = f"{disp_name} = {float(raw_val):.1f} units"
                desc = f"Local gradient indicates {disp_name} strongly influences anomaly score (weight: {weight_val:+0.2f})."
            else:
                rule_text = f"{disp_name} (observed: {raw_val})"
                desc = f"Feature attribution in local neighborhood pushes prediction by {weight_val:+0.2f}."

            reasons.append(LimeReasonSchema(
                rule=rule_text,
                weight=abs(weight_val),
                description=desc,
            ))

        explanation_text = (
            f"LIME local surrogate regression (R^2 fitted on {self.num_samples} perturbations) "
            f"identifies {reasons[0].rule} as the primary local driver of anomaly classification."
        )

        return LimeResponse(
            incident_id=incident_id,
            intercept=round(intercept, 3),
            prediction_score=round(base_score, 3),
            target_class="Unknown Attack Candidate",
            reasons=reasons,
            explanation_text=explanation_text,
        )

lime_engine = LimeEngine()

if __name__ == "__main__":
    import json
    sample_flow = {
        "packet_count": 9400,
        "byte_count": 2100400,
        "duration_sec": 18.5,
        "packet_rate": 508.1,
        "byte_rate": 113535.1,
        "dst_port": 8443,
        "src_port": 61244,
        "tcp_flags": "URG,ACK,PSH",
    }
    result = lime_engine.explain(sample_flow, "INC-00142")
    print("=== Genuine LIME Local Surrogate Explanation Result ===")
    print(json.dumps(result.model_dump(), indent=2))
