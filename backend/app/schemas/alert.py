from pydantic import BaseModel
from typing import Optional

class AlertResponse(BaseModel):
    alert_id: str
    flow_id: str
    detected_at: str
    severity: str
    classification: str
    confidence: float
    anomaly_score: float
    src_ip: str
    dst_ip: str
    status: str
