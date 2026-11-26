import time
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.database.repositories.flow_repository import FlowRepository
from app.services.detection_service import detection_service
from app.schemas.flow import FlowCreate, TrafficStatsResponse
from live_packet_sniffer import live_sniffer, get_available_interfaces

router = APIRouter(prefix="/traffic", tags=["Traffic Telemetry"])
flow_repo = FlowRepository()

class SnifferStartRequest(BaseModel):
    interface: Optional[str] = None
    window_seconds: float = 3.0
    bpf_filter: str = "ip"

@router.get("/realtime")
async def get_realtime_traffic():
    """
    Returns the latest real-time network flows and dynamically computed traffic statistics
    directly from the active database repository.
    """
    flows = flow_repo.get_all(limit=50)
    stats = flow_repo.get_statistics()
    is_demo = (stats["total_flows"] == 0)
    
    # If no real flows recorded yet, provide baseline initial values
    if is_demo:
        stats = {
            "total_flows": 0,
            "active_flows": 0,
            "packets_per_sec": 0.0,
            "bytes_per_sec": 0.0,
            "tcp_percent": 0.0,
            "udp_percent": 0.0,
            "icmp_percent": 0.0,
            "top_sources": [],
            "top_destinations": [],
            "top_ports": [],
        }

    return {
        "flows": flows,
        "stats": stats,
        "is_demo": is_demo,
    }

@router.get("/history")
async def get_traffic_history(range_val: str = Query("1H", alias="range", pattern="^(1H|6H|24H|7D)$")):
    """
    Returns time-bucketed historical traffic trends computed directly from SQLite.
    Eliminates hardcoded values when live records exist.
    """
    return flow_repo.get_historical_trend(range_val)

@router.post("/ingest")
async def ingest_flow(flow: FlowCreate):
    """
    Ingests an extracted 5-tuple network flow.
    Runs ML classification, Autoencoder anomaly scoring, and Open-Set candidate evaluation.
    Persists flow and generated incidents into SQLite, then broadcasts to WebSocket clients.
    """
    res = detection_service.ingest_flow(flow.dict())
    try:
        from app.main import ws_manager
        is_attack = res.get("final_label") != "Normal"
        is_zero_day = res.get("is_zero_day_candidate", False)
        
        event_type = "UNKNOWN_ATTACK" if is_zero_day else ("ALERT_CREATED" if is_attack else "FLOW_UPDATE")
        await ws_manager.broadcast({
            "type": event_type,
            "payload": res,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
    except Exception:
        pass
    return res

@router.post("/maintenance/retention")
async def apply_retention(hours: int = 168):
    """
    Enforces configured data retention policy by purging network flows older than `hours` (default: 7 days).
    """
    pruned = flow_repo.apply_retention_policy(hours)
    return {
        "status": "SUCCESS",
        "records_pruned": pruned,
        "retention_hours": hours,
        "remaining_count": flow_repo.get_count(),
    }

@router.get("/interfaces")
async def list_network_interfaces():
    """
    Discovers and enumerates host network interfaces (Wi-Fi, Ethernet, Loopback)
    available for Scapy live packet capture.
    """
    ifaces = get_available_interfaces()
    return {
        "interfaces": ifaces,
        "count": len(ifaces),
        "sniffer_status": live_sniffer.get_status(),
    }

@router.get("/sniffer/status")
async def get_sniffer_status():
    """Returns real-time status and operational metrics of the live packet sniffer."""
    return live_sniffer.get_status()

@router.post("/sniffer/start")
async def start_sniffer(req: SnifferStartRequest):
    """Starts live packet capture on the selected or default host network interface."""
    live_sniffer.interface = req.interface
    live_sniffer.window_seconds = req.window_seconds
    live_sniffer.bpf_filter = req.bpf_filter
    
    success = live_sniffer.start(background=True)
    if not success and live_sniffer.last_error:
        raise HTTPException(status_code=500, detail=live_sniffer.last_error)
        
    return {
        "status": "STARTED" if live_sniffer.is_running else "FAILED",
        "details": live_sniffer.get_status(),
    }

@router.post("/sniffer/stop")
async def stop_sniffer():
    """Stops the active live packet capture and flushes any pending flows."""
    live_sniffer.stop()
    return {
        "status": "STOPPED",
        "details": live_sniffer.get_status(),
    }

@router.post("/demo/generate")
async def generate_demo_burst(count: int = 5):
    """
    Explicitly triggers a synthetic test flow burst for demonstration purposes.
    Clearly tags generated flows so synthetic data is never confused with live metrics.
    """
    results = live_sniffer.replay_demo_burst(count=count)
    return {
        "status": "COMPLETED",
        "mode": "DEMO",
        "ingested_count": len(results),
        "results": results,
    }
