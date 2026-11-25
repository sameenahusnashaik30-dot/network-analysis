from pydantic import BaseModel
from typing import List, Any

class FeatureContributionSchema(BaseModel):
    feature_name: str
    contribution: float
    feature_value: Any
    is_positive: bool

class ShapResponse(BaseModel):
    incident_id: str
    base_value: float
    prediction_score: float
    target_class: str
    features: List[FeatureContributionSchema]
    summary: str

class LimeReasonSchema(BaseModel):
    rule: str
    weight: float
    description: str

class LimeResponse(BaseModel):
    incident_id: str
    intercept: float
    prediction_score: float
    target_class: str
    reasons: List[LimeReasonSchema]
    explanation_text: str

class ReliabilityResponse(BaseModel):
    stability_score: int
    feature_ranking_consistency: float
    perturbation_test_result: str
    tested_features_count: int
    perturbation_sigma: float
    top_features_retained: List[str]
