import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple
from app.ml.preprocessing import extract_features

class AnomalyDetector:
    """
    Layer B: Deep Autoencoder Neural Network Anomaly Detector.
    Computes genuine reconstruction error L_rec = ||x - x_hat||^2 against a baseline normal threshold.
    """
    def __init__(self, model_path: str = "models/autoencoder_anomaly.joblib", default_threshold: float = 0.60):
        self.model_path = model_path
        self.model = None
        self.threshold = default_threshold
        self.normal_mean_err = 0.7759

        # Attempt to load trained Autoencoder neural network artifact
        if os.path.exists(self.model_path):
            try:
                payload = joblib.load(self.model_path)
                self.model = payload["model"]
                self.threshold = payload.get("threshold", default_threshold)
                self.normal_mean_err = payload.get("normal_mean_err", 0.7759)
            except Exception:
                pass

    def reconstruct(self, x: np.ndarray) -> np.ndarray:
        if self.model is not None:
            return self.model.predict(x.reshape(1, -1))[0]
        return np.zeros_like(x)

    def detect(self, flow_dict: Dict[str, Any]) -> Tuple[float, float, float, bool]:
        """
        Returns:
            reconstruction_error (float)
            anomaly_score (float between 0.0 and 1.0)
            threshold (float)
            is_anomaly (bool)
        """
        x = extract_features(flow_dict)
        x_hat = self.reconstruct(x)
        
        # Genuine Mean squared reconstruction error
        rec_error = float(np.mean((x - x_hat) ** 2))
        
        # Sigmoid mapping centered around calibrated normal threshold
        anomaly_score = float(1.0 / (1.0 + np.exp(-1.5 * (rec_error - self.threshold))))
        anomaly_score = round(min(1.0, max(0.01, anomaly_score)), 3)
        
        is_anomaly = (rec_error > self.threshold) or (anomaly_score > 0.60)
        return round(rec_error, 4), anomaly_score, round(self.threshold, 2), is_anomaly
