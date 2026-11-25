from typing import Dict, Any, Tuple

class OpenSetDetector:
    """
    Layer C: Open-Set Recognition Engine.
    Ensures that high-reconstruction-loss traffic with weak supervised confidence
    or unusual protocol/flag combinations is NOT forced into an existing known attack class.
    """
    def __init__(self, confidence_threshold: float = 0.80, anomaly_threshold: float = 0.60):
        self.confidence_threshold = confidence_threshold
        self.anomaly_threshold = anomaly_threshold

    def evaluate(
        self,
        known_class: str,
        known_confidence: float,
        anomaly_score: float,
        flow_dict: Dict[str, Any]
    ) -> Tuple[bool, float, str, str]:
        """
        Returns:
            is_unknown (bool)
            unknown_score (float)
            decision_label (str)
            reason (str)
        """
        tcp_flags = str(flow_dict.get("tcp_flags", ""))
        packet_rate = float(flow_dict.get("packet_rate", 0))

        # 1. Normal traffic: low reconstruction error and predicted class is Normal
        if known_class == "Normal" and anomaly_score < self.anomaly_threshold:
            return False, round(1.0 - known_confidence, 3), "Normal", "Traffic conforms with normal baseline manifold."

        # 2. Open-Set Zero-Day Candidate Trigger:
        # If anomaly is severe (> threshold) AND (confidence is below strong threshold OR unusual flags like URG are present)
        is_novel_flag = ("URG" in tcp_flags)
        if anomaly_score >= self.anomaly_threshold and (known_confidence < self.confidence_threshold or is_novel_flag):
            unknown_score = round(max(0.68, anomaly_score * (1.0 - known_confidence + 0.35)), 3)
            unknown_score = min(0.99, unknown_score)
            
            if unknown_score > 0.80 or is_novel_flag or packet_rate > 400:
                label = "Zero-Day Candidate"
                reason = (
                    f"Extreme Autoencoder reconstruction loss ({anomaly_score}) with ambiguous classifier certainty "
                    f"({known_confidence:.2f}) and novel feature combinations. Open-set recognition prevents misclassification."
                )
            else:
                label = "Unknown Attack"
                reason = f"Reconstruction error exceeds baseline; confidence in nearest known class '{known_class}' is only {known_confidence:.2f}."

            return True, unknown_score, label, reason

        # 3. Verified Known Attack: high confidence in an attack class with anomaly confirmation
        if known_class != "Normal" and known_confidence >= self.confidence_threshold:
            return False, round(1.0 - known_confidence, 3), known_class, f"Matches known attack signature for {known_class} with {int(known_confidence*100)}% confidence."

        # 4. Low anomaly, but low attack confidence
        return False, 0.40, "Suspicious", "Borderline feature profile requiring further telemetry observation."
