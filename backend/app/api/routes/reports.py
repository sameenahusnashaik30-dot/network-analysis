from fastapi import APIRouter
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
async def get_reports():
    return report_service.get_reports()
