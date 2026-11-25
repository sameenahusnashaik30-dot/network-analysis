from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class IncidentStatusUpdate(BaseModel):
    status: str

class IncidentResponse(BaseModel):
    incident_id: str
    flow_id: str
    detected_at: str
    last_observed_at: str
    severity: str
    classification: str
    confidence: float
    anomaly_score: float
    unknown_score: float
    status: str
    is_zero_day_candidate: bool
    
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    packet_count: int
    byte_count: int
    duration_sec: float
    packet_rate: float
    byte_rate: float
    tcp_flags: Optional[str] = None
    
    sdn_event: Optional[Dict[str, Any]] = None
    recommended_action: str
    mitigation_status: Optional[str] = None
    mitigation_audit: Optional[Dict[str, Any]] = None
