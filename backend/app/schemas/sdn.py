from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SDNSwitchSchema(BaseModel):
    dpid: str
    name: str
    ip_address: str
    openflow_version: str
    connected_since: str
    ports_count: int
    flow_count: int
    packet_in_rate: float
    status: str

class SDNFlowRuleSchema(BaseModel):
    rule_id: str
    dpid: str
    table_id: int
    priority: int
    match: Dict[str, Any]
    actions: List[str]
    packet_count: int
    byte_count: int
    duration_sec: float
    hard_timeout: int
    idle_timeout: int

class SDNControllerEventSchema(BaseModel):
    event_id: str
    timestamp: str
    event_type: str
    dpid: str
    severity: str
    details: str

class SDNStatusResponse(BaseModel):
    is_online: bool
    controller_name: str
    controller_version: str
    openflow_status: str
    connected_switches: int
    active_rules: int
    latency_ms: float
    error_count: int
    uptime_seconds: int
