from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class AuditLog:
    log_id: str
    timestamp: str
    username: str
    user_role: str
    action_type: str
    resource_id: str
    status: str
    details: str
    metadata: Optional[Dict[str, Any]] = None
