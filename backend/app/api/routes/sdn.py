from fastapi import APIRouter
from app.sdn.controller_client import sdn_client
from app.schemas.sdn import SDNStatusResponse

router = APIRouter(prefix="/sdn", tags=["SDN Controller"])

@router.get("/status", response_model=SDNStatusResponse)
async def get_controller_status():
    return await sdn_client.get_status()

@router.get("/switches")
async def get_switches():
    return await sdn_client.get_switches()

@router.get("/flows")
async def get_flow_rules():
    return await sdn_client.get_flow_rules()

@router.get("/events")
async def get_controller_events():
    return await sdn_client.get_events()
