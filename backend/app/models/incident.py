from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class Incident:
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
    
    recommended_action: str
    tcp_flags: Optional[str] = None
    sdn_event: Optional[Dict[str, Any]] = None
    mitigation_status: Optional[str] = "RECOMMENDED"
    mitigation_audit: Optional[Dict[str, Any]] = None
