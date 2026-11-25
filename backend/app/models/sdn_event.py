from dataclasses import dataclass

@dataclass
class SDNEvent:
    event_id: str
    timestamp: str
    event_type: str
    dpid: str
    severity: str
    details: str
