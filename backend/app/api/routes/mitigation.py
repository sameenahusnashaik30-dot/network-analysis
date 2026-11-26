from datetime import datetime
from fastapi import APIRouter, Depends
from app.schemas.mitigation import (
    MitigationApproveRequest,
    MitigationRejectRequest,
    MitigationRollbackRequest,
    MitigationResponse
)
from app.services.mitigation_service import mitigation_service
from app.api.dependencies import get_current_user
from app.schemas.auth import TokenData

router = APIRouter(prefix="/mitigation", tags=["Mitigation & Enforcement"])

@router.post("/approve", response_model=MitigationResponse)
async def approve_mitigation(
    req: MitigationApproveRequest,
    current_user: TokenData = Depends(get_current_user)
):
    res = await mitigation_service.approve_and_block(
        incident_id=req.incident_id,
        action=req.action,
        duration_sec=req.duration_sec or 3600,
        admin_user=current_user.username,
        admin_role=current_user.role,
    )
    try:
        from app.main import ws_manager
        await ws_manager.broadcast({
            "type": "MITIGATION_RESULT",
            "payload": {
                "incident_id": req.incident_id,
                "status": "EXECUTED",
                "action": req.action,
                "audit_id": res.get("audit_id"),
                "flow_rule": res.get("flow_rule_installed"),
                "approved_by": current_user.username,
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
    except Exception:
        pass
    return res

@router.post("/reject")
async def reject_mitigation(
    req: MitigationRejectRequest,
    current_user: TokenData = Depends(get_current_user)
):
    res = mitigation_service.reject_mitigation(
        incident_id=req.incident_id,
        reason=req.reason,
        username=current_user.username,
        user_role=current_user.role,
    )
    try:
        from app.main import ws_manager
        await ws_manager.broadcast({
            "type": "MITIGATION_RESULT",
            "payload": {
                "incident_id": req.incident_id,
                "status": "REJECTED",
                "reason": req.reason,
                "rejected_by": current_user.username,
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
    except Exception:
        pass
    return res

@router.post("/rollback", response_model=MitigationResponse)
async def rollback_mitigation(
    req: MitigationRollbackRequest,
    current_user: TokenData = Depends(get_current_user)
):
    res = await mitigation_service.rollback_mitigation(
        incident_id=req.incident_id,
        admin_user=current_user.username,
        admin_role=current_user.role,
        reason=req.reason or "Admin manual rollback",
    )
    try:
        from app.main import ws_manager
        await ws_manager.broadcast({
            "type": "MITIGATION_RESULT",
            "payload": {
                "incident_id": req.incident_id,
                "status": "ROLLED_BACK",
                "audit_id": res.get("audit_id"),
                "rolled_back_by": current_user.username,
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
    except Exception:
        pass
    return res
