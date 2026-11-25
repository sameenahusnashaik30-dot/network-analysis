from fastapi import APIRouter, HTTPException, status
from app.services.alert_service import incident_service
from app.xai.shap_engine import shap_engine
from app.xai.lime_engine import lime_engine
from app.xai.reliability import reliability_engine
from app.schemas.xai import ShapResponse, LimeResponse, ReliabilityResponse

router = APIRouter(prefix="/xai", tags=["Explainable AI"])

def _get_flow_dict(incident_id: str):
    inc = incident_service.get_by_id(incident_id)
    if not inc:
        # Fallback default flow representation
        return {
            "packet_count": 9400,
            "byte_count": 2100400,
            "duration_sec": 18.5,
            "packet_rate": 508.1,
            "byte_rate": 113535.1,
            "dst_port": 8443,
            "src_port": 61244,
            "tcp_flags": "URG,ACK,PSH",
        }
    return {
        "packet_count": inc.packet_count,
        "byte_count": inc.byte_count,
        "duration_sec": inc.duration_sec,
        "packet_rate": inc.packet_rate,
        "byte_rate": inc.byte_rate,
        "dst_port": inc.dst_port,
        "src_port": inc.src_port,
        "tcp_flags": inc.tcp_flags,
    }

@router.get("/{incident_id}/shap", response_model=ShapResponse)
async def get_shap_explanation(incident_id: str):
    flow_dict = _get_flow_dict(incident_id)
    return shap_engine.explain(flow_dict, incident_id)

@router.get("/{incident_id}/lime", response_model=LimeResponse)
async def get_lime_explanation(incident_id: str):
    flow_dict = _get_flow_dict(incident_id)
    return lime_engine.explain(flow_dict, incident_id)

@router.get("/{incident_id}/reliability", response_model=ReliabilityResponse)
async def get_explanation_reliability(incident_id: str):
    flow_dict = _get_flow_dict(incident_id)
    return reliability_engine.evaluate_stability(flow_dict, incident_id)
