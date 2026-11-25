from typing import Dict, Any
from app.ml.known_attack_classifier import KnownAttackClassifier
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.open_set_detector import OpenSetDetector
from app.schemas.prediction import (
    HybridDetectionResult,
    KnownPrediction,
    AnomalyDecision,
    OpenSetDecision,
)

class DetectionEngine:
    def __init__(self):
        self.classifier = KnownAttackClassifier()
        self.anomaly_detector = AnomalyDetector()
        self.open_set_detector = OpenSetDetector()

    def process_flow(self, flow_dict: Dict[str, Any]) -> HybridDetectionResult:
        flow_id = str(flow_dict.get("flow_id", "FL-UNKNOWN"))

        # Layer A: Known Attack Classification
        known_class, confidence, probs = self.classifier.predict(flow_dict)

        # Layer B: Anomaly Detection
        rec_error, anomaly_score, threshold, is_anomaly = self.anomaly_detector.detect(flow_dict)

        # Layer C: Open-Set / Zero-Day Decision
        is_unknown, unknown_score, final_label, reason = self.open_set_detector.evaluate(
            known_class=known_class,
            known_confidence=confidence,
            anomaly_score=anomaly_score,
            flow_dict=flow_dict,
        )

        return HybridDetectionResult(
            flow_id=flow_id,
            final_label=final_label,
            is_zero_day_candidate=(final_label == "Zero-Day Candidate"),
            confidence=confidence,
            anomaly_score=anomaly_score,
            unknown_score=unknown_score,
            known_prediction=KnownPrediction(
                predicted_class=known_class,
                confidence=confidence,
                probabilities=probs,
            ),
            anomaly_detector=AnomalyDecision(
                reconstruction_error=rec_error,
                anomaly_score=anomaly_score,
                threshold=threshold,
                is_anomaly=is_anomaly,
            ),
            open_set=OpenSetDecision(
                is_unknown=is_unknown,
                unknown_score=unknown_score,
                decision_label=final_label,
                reason=reason,
            ),
        )

detection_engine = DetectionEngine()
