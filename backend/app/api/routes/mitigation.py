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
    # Pass user & role to service where authorization is strictly verified
    res = await mitigation_service.approve_and_block(
        incident_id=req.incident_id,
        action=req.action,
        duration_sec=req.duration_sec or 3600,
        admin_user=current_user.username,
        admin_role=current_user.role,
    )
    return res

@router.post("/reject")
async def reject_mitigation(
    req: MitigationRejectRequest,
    current_user: TokenData = Depends(get_current_user)
):
    return mitigation_service.reject_mitigation(
        incident_id=req.incident_id,
        reason=req.reason,
        username=current_user.username,
        user_role=current_user.role,
    )

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
    return res
