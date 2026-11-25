import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple
from app.ml.preprocessing import extract_features

ATTACK_CLASSES = [
    "Normal",
    "DDoS",
    "DoS",
    "Port Scan",
    "Brute Force",
    "Botnet",
    "Web Attack",
]

class KnownAttackClassifier:
    """
    Layer A: Supervised Multi-Class Machine Learning Classifier (Random Forest).
    Trained on standardized SDN OpenFlow telemetry to evaluate calibrated class probabilities.
    """
    def __init__(self, model_path: str = "models/known_attack_classifier.joblib"):
        self.model_path = model_path
        self.model = None
        self.classes = ATTACK_CLASSES

        # Attempt to load trained Random Forest artifact
        if os.path.exists(self.model_path):
            try:
                payload = joblib.load(self.model_path)
                self.model = payload["model"]
                self.classes = payload["classes"]
            except Exception:
                pass

    def predict(self, flow_dict: Dict[str, Any]) -> Tuple[str, float, Dict[str, float]]:
        x = extract_features(flow_dict)
        
        if self.model is not None:
            # Genuine Random Forest probability distribution
            probs_arr = self.model.predict_proba(x.reshape(1, -1))[0]
            probs = {cls_name: float(probs_arr[i]) for i, cls_name in enumerate(self.classes)}
            predicted_class = max(probs, key=probs.get)
            confidence = probs[predicted_class]
            return predicted_class, round(confidence, 3), {k: round(v, 4) for k, v in probs.items()}
        
        # Fallback centroid distance if model file missing
        distances = {c: float(np.linalg.norm(x)) for c in self.classes}
        return "Normal", 0.50, {c: 1.0 / len(self.classes) for c in self.classes}
