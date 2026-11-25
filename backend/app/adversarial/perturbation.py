import numpy as np
from typing import Dict, Any

def apply_feature_perturbation(features: np.ndarray, epsilon: float = 0.12) -> np.ndarray:
    """Simulates targeted gradient or adversarial feature shifting within an epsilon ball."""
    noise = np.random.uniform(-epsilon, epsilon, size=features.shape)
    return features + noise

def perturb_flow_telemetry(flow: Dict[str, Any], epsilon: float = 0.12, category: str = "Feature Perturbation") -> Dict[str, Any]:
    """Perturbs continuous flow fields according to selected adversarial attack type."""
    perturbed = dict(flow)
    np.random.seed(int(perturbed.get("src_port", 40000)))

    if category == "Traffic Timing Evasion":
        # Adversary inserts small transmission pauses to decrease packet rate and mimic normal traffic
        factor = 1.0 - (epsilon * 1.5)
        perturbed["packet_rate"] = max(10.0, float(perturbed.get("packet_rate", 200)) * factor)
        perturbed["duration_sec"] = float(perturbed.get("duration_sec", 10)) * (1.0 + epsilon)
    elif category == "Payload Size Morphing":
        # Adversary pads packet payload to alter byte rate
        factor = 1.0 + (epsilon * 2.0)
        perturbed["byte_count"] = float(perturbed.get("byte_count", 50000)) * factor
        perturbed["byte_rate"] = float(perturbed.get("byte_rate", 5000)) * factor
    else:
        # General feature shift
        shift = 1.0 + np.random.normal(0, epsilon)
        perturbed["packet_rate"] = max(5.0, float(perturbed.get("packet_rate", 200)) * shift)
        perturbed["byte_rate"] = max(50.0, float(perturbed.get("byte_rate", 5000)) * shift)

    return perturbed
