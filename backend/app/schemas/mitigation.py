from pydantic import BaseModel
from typing import Optional

class MitigationApproveRequest(BaseModel):
    incident_id: str
    action: str
    duration_sec: Optional[int] = 3600

class MitigationRejectRequest(BaseModel):
    incident_id: str
    reason: str

class MitigationResponse(BaseModel):
    success: bool
    message: str
    audit_id: str
    executed_action: str
    flow_rule_installed: Optional[str] = None
