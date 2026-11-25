from fastapi import APIRouter, HTTPException, status
from app.services.alert_service import incident_service
from app.database.repositories.incident_repository import IncidentRepository
from app.schemas.incident import IncidentStatusUpdate

router = APIRouter(prefix="/zero-day", tags=["Zero-Day Detection"])
repo = IncidentRepository()

@router.get("")
async def get_zero_day_threats():
    return incident_service.get_zero_day_threats()

@router.get("/{incident_id}")
async def get_zero_day_by_id(incident_id: str):
    inc = repo.get_by_id(incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Zero-day incident {incident_id} not found."
        )
    return inc

@router.post("/{incident_id}/status")
async def update_zero_day_status(incident_id: str, update: IncidentStatusUpdate):
    repo.update_status(incident_id, update.status)
    return {"success": True, "status": update.status}
