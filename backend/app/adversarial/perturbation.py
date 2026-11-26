import numpy as np
from typing import Dict, Any

def apply_feature_perturbation(features: np.ndarray, epsilon: float = 0.12) -> np.ndarray:
    """Bounded adversarial feature perturbation in standardized feature space."""
    noise = np.random.uniform(-epsilon, epsilon, size=features.shape)
    return features + noise

def perturb_flow_telemetry(
    flow: Dict[str, Any],
    epsilon: float = 0.12,
    category: str = "Feature Perturbation"
) -> Dict[str, Any]:
    """
    Applies network-constrained adversarial perturbations to a flow dictionary.
    Respects physical protocol constraints:
    - packet_count >= 1 (integer)
    - byte_count >= 40 (integer)
    - duration_sec >= 0.05 (float)
    - packet_rate == packet_count / duration_sec
    - byte_rate == byte_count / duration_sec
    - valid port ranges
    """
    perturbed = dict(flow)
    np.random.seed(int(perturbed.get("src_port", 40000)) % 100000)

    duration = max(0.1, float(perturbed.get("duration_sec", 1.0)))
    pkt_cnt = max(1, int(float(perturbed.get("packet_count", 100))))
    byte_cnt = max(40, int(float(perturbed.get("byte_count", 5000))))

    if category == "Traffic Timing Evasion":
        # Adversary dilates packet inter-arrival times to drop packet rate below detection threshold
        dilated_duration = duration * (1.0 + (epsilon * 2.5))
        duration = max(0.1, dilated_duration)
        # Packet count remains the same or slight jitter
        pkt_cnt = max(1, int(pkt_cnt * (1.0 + np.random.uniform(-epsilon * 0.2, epsilon * 0.2))))

    elif category == "Payload Size Morphing":
        # Adversary pads packet payload or fragments to alter byte-to-packet ratios
        morph_factor = 1.0 + (epsilon * 3.0)
        byte_cnt = max(40, int(byte_cnt * morph_factor))

    elif category == "Flag Manipulation Evasion":
        # Adversary injects standard session control flags (ACK, PSH) to dilute pure SYN/RST signatures
        current_flags = str(perturbed.get("tcp_flags", "SYN")).upper()
        if "SYN" in current_flags and "ACK" not in current_flags:
            perturbed["tcp_flags"] = "SYN,ACK"
        elif "PSH" not in current_flags:
            perturbed["tcp_flags"] = f"{current_flags},PSH"

    elif category == "Gaussian Noise":
        # Controlled Gaussian feature noise
        noise_factor = 1.0 + np.random.normal(0, epsilon)
        pkt_cnt = max(1, int(pkt_cnt * max(0.1, noise_factor)))
        byte_cnt = max(40, int(byte_cnt * max(0.1, noise_factor)))
        duration = max(0.1, duration * max(0.2, 1.0 + np.random.normal(0, epsilon * 0.5)))

    else:
        # Default continuous feature shift within epsilon-ball
        shift = 1.0 + np.random.uniform(-epsilon, epsilon)
        pkt_cnt = max(1, int(pkt_cnt * max(0.1, shift)))
        byte_cnt = max(40, int(byte_cnt * max(0.1, shift)))

    # Recompute constrained continuous derived rates
    duration_sec = round(max(0.05, duration), 3)
    perturbed["packet_count"] = pkt_cnt
    perturbed["byte_count"] = byte_cnt
    perturbed["duration_sec"] = duration_sec
    perturbed["packet_rate"] = round(pkt_cnt / duration_sec, 2)
    perturbed["byte_rate"] = round(byte_cnt / duration_sec, 2)

    return perturbed
