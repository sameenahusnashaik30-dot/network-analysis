from pydantic import BaseModel, Field
from typing import Optional, List

class FlowBase(BaseModel):
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
    tcp_flags: Optional[str] = None

class FlowCreate(FlowBase):
    pass

class FlowResponse(FlowBase):
    timestamp: str
    classification: str
    confidence: float
    anomaly_score: float
    is_unknown: bool
    status: str

class TrafficStatsResponse(BaseModel):
    total_flows: int
    active_flows: int
    packets_per_sec: float
    bytes_per_sec: float
    tcp_percent: float
    udp_percent: float
    icmp_percent: float
    top_sources: List[dict]
    top_destinations: List[dict]
    top_ports: List[dict]

class TrafficHistoryPoint(BaseModel):
    timestamp: str
    normal: int
    suspicious: int
    malicious: int
