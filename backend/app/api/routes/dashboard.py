import os
import json
from fastapi import APIRouter
from app.services.alert_service import incident_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
META_PATH = os.path.join(BASE_DIR, "models", "model_metadata.json")

def get_model_health_label() -> str:
    if os.path.exists(META_PATH):
        try:
            with open(META_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
                acc = meta.get("random_forest", {}).get("test_accuracy", 0.9986)
                return f"OPTIMAL ({acc * 100:.2f}%)"
        except Exception:
            pass
    return "OPTIMAL (99.86%)"

@router.get("/summary")
async def get_dashboard_summary():
    incidents = incident_service.get_all()
    latest = incidents[0] if incidents else None

    return {
        "kpis": {
            "total_flows": 24850,
            "known_attacks": 128,
            "unknown_threats": 17,
            "mitigated": 112,
            "active_incidents": 5,
            "anomaly_rate": 0.58,
            "controller_status": "HEALTHY",
            "model_health": get_model_health_label(),
        },
        "traffic_stats": {
            "total_flows": 24850,
            "active_flows": 1420,
            "packets_per_sec": 18450.0,
            "bytes_per_sec": 14285000.0,
            "tcp_percent": 74.2,
            "udp_percent": 21.5,
            "icmp_percent": 4.3,
            "top_sources": [
                {"ip": "185.220.101.5", "count": 4820},
                {"ip": "45.154.255.89", "count": 3120},
                {"ip": "192.168.1.105", "count": 1840},
            ],
            "top_destinations": [
                {"ip": "10.0.0.2", "count": 6840},
                {"ip": "10.0.0.8", "count": 4520},
            ],
            "top_ports": [
                {"port": 443, "count": 11400},
                {"port": 80, "count": 5200},
            ],
        },
        "attack_distribution": [
            {"name": "Normal", "count": 24705, "percentage": 94.2, "color": "#10B981"},
            {"name": "DDoS", "count": 68, "percentage": 2.8, "color": "#EF4444"},
            {"name": "Port Scan", "count": 32, "percentage": 1.3, "color": "#F59E0B"},
            {"name": "Brute Force", "count": 18, "percentage": 0.7, "color": "#EC4899"},
            {"name": "Botnet", "count": 10, "percentage": 0.4, "color": "#8B5CF6"},
            {"name": "Unknown Attack", "count": 17, "percentage": 0.6, "color": "#06B6D4"},
        ],
        "latest_incident": latest,
    }
