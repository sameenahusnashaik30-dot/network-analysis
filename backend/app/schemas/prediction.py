from pydantic import BaseModel
from typing import List, Optional

class KnownPrediction(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: dict

class AnomalyDecision(BaseModel):
    reconstruction_error: float
    anomaly_score: float
    threshold: float
    is_anomaly: bool

class OpenSetDecision(BaseModel):
    is_unknown: bool
    unknown_score: float
    decision_label: str
    reason: str

class HybridDetectionResult(BaseModel):
    flow_id: str
    final_label: str
    is_zero_day_candidate: bool
    confidence: float
    anomaly_score: float
    unknown_score: float
    known_prediction: KnownPrediction
    anomaly_detector: AnomalyDecision
    open_set: OpenSetDecision
