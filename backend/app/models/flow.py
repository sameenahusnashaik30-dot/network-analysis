from dataclasses import dataclass
from typing import Optional

@dataclass
class Flow:
    flow_id: str
    switch_id: str
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
    timestamp: str
    classification: str
    confidence: float
    anomaly_score: float
    is_unknown: bool
    status: str
    tcp_flags: Optional[str] = None
