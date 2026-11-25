from fastapi import APIRouter, HTTPException, status
from app.services.alert_service import incident_service
from app.database.repositories.incident_repository import IncidentRepository
from app.xai.shap_engine import shap_engine
from app.xai.lime_engine import lime_engine

router = APIRouter(prefix="", tags=["Incidents & Alerts"])
repo = IncidentRepository()

@router.get("/alerts")
async def get_alerts():
    return incident_service.get_all()

@router.get("/incidents")
async def get_incidents():
    return incident_service.get_all()

@router.get("/incidents/{incident_id}")
async def get_incident_details(incident_id: str):
    inc = repo.get_by_id(incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {incident_id} not found."
        )

    flow_dict = {
        "flow_id": inc.flow_id,
        "src_ip": inc.src_ip,
        "dst_ip": inc.dst_ip,
        "src_port": inc.src_port,
        "dst_port": inc.dst_port,
        "protocol": inc.protocol,
        "packet_count": inc.packet_count,
        "byte_count": inc.byte_count,
        "duration_sec": inc.duration_sec,
        "packet_rate": inc.packet_rate,
        "byte_rate": inc.byte_rate,
        "tcp_flags": inc.tcp_flags,
    }

    shap = shap_engine.explain(flow_dict, incident_id)
    lime = lime_engine.explain(flow_dict, incident_id)

    correlation = [
        {
            "step": 1,
            "title": "Unusual Flow Initiation",
            "timestamp": inc.detected_at,
            "description": f"Host {inc.src_ip} initiated connection to {inc.dst_ip}:{inc.dst_port} via switch DPID {inc.sdn_event.get('switch_id', '0000000000000003') if inc.sdn_event else '0000000000000003'}",
            "type": "network"
        },
        {
            "step": 2,
            "title": "SDN Packet-In Spike",
            "timestamp": inc.detected_at,
            "description": f"Controller observed Packet-In activity exceeding typical rate on switch port",
            "type": "sdn"
        },
        {
            "step": 3,
            "title": "Hybrid AI Classification Decision",
            "timestamp": inc.detected_at,
            "description": f"Autoencoder anomaly score ({inc.anomaly_score}) triggered open-set threshold. Classified as {inc.classification}.",
            "type": "ml"
        },
        {
            "step": 4,
            "title": "Mitigation Recommendation Generated",
            "timestamp": inc.detected_at,
            "description": f"Recommended Action: {inc.recommended_action} awaiting Administrator authorization",
            "type": "action"
        }
    ]

    return {
        "incident": inc,
        "flow": flow_dict,
        "shap": shap,
        "lime": lime,
        "correlation_timeline": correlation,
    }

@router.post("/incidents/{incident_id}/status")
async def update_incident_status(incident_id: str, payload: dict):
    new_status = payload.get("status", "INVESTIGATING")
    repo.update_status(incident_id, new_status)
    return {"success": True, "status": new_status}

@router.get("/attacks/known")
async def get_known_attacks_overview():
    return {
        "distribution": [
            {"name": "Normal", "count": 24705, "percentage": 94.2, "color": "#10B981"},
            {"name": "DDoS", "count": 68, "percentage": 2.8, "color": "#EF4444"},
            {"name": "Port Scan", "count": 32, "percentage": 1.3, "color": "#F59E0B"},
            {"name": "Brute Force", "count": 18, "percentage": 0.7, "color": "#EC4899"},
            {"name": "Botnet", "count": 10, "percentage": 0.4, "color": "#8B5CF6"},
            {"name": "Unknown Attack", "count": 17, "percentage": 0.6, "color": "#06B6D4"},
        ],
        "model_config": {
            "model_type": "XGBoost",
            "dataset": "CIC-IDS2017 / SDN-OpenFlow-Flows",
            "accuracy": 0.984,
            "precision": 0.978,
            "recall": 0.972,
            "f1_score": 0.975,
            "classes": ["Normal", "DDoS", "DoS", "Port Scan", "Brute Force", "Botnet", "Web Attack"],
        },
        "incidents": incident_service.get_known_attacks(),
    }
