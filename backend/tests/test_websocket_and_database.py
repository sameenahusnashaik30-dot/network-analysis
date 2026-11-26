import pytest
import json
import time
from fastapi.testclient import TestClient
from app.main import app, ws_manager
from app.database.repositories.flow_repository import FlowRepository
from app.models.flow import Flow

client = TestClient(app)
flow_repo = FlowRepository()

def test_websocket_connection_and_handshake():
    """Verify WebSocket handshake delivers honest SYSTEM_STATUS with database metrics."""
    with client.websocket_connect("/ws") as websocket:
        data = websocket.receive_text()
        msg = json.loads(data)
        assert msg["type"] == "SYSTEM_STATUS"
        payload = msg["payload"]
        assert "status" in payload
        assert "openflow_status" in payload
        assert "total_flows" in payload
        assert "ml_health" in payload
        assert isinstance(payload["total_flows"], int)

def test_websocket_broadcast_on_traffic_ingestion():
    """Verify that posting a flow to /api/traffic/ingest broadcasts an event to active WebSocket clients."""
    with client.websocket_connect("/ws") as websocket:
        # Receive initial SYSTEM_STATUS
        _ = websocket.receive_text()

        # Ingest a test flow
        payload = {
            "flow_id": f"WS-TEST-{int(time.time() * 1000) % 100000}",
            "switch_id": "0000000000000001",
            "src_ip": "192.168.1.188",
            "dst_ip": "10.0.0.10",
            "src_port": 51234,
            "dst_port": 80,
            "protocol": "TCP",
            "packet_count": 2500,
            "byte_count": 180000,
            "duration_sec": 20.0,
            "packet_rate": 125.0,
            "byte_rate": 9000.0,
            "tcp_flags": "ACK",
        }
        resp = client.post("/api/traffic/ingest", json=payload)
        assert resp.status_code == 200

        # WebSocket should immediately receive broadcast event
        ws_event_text = websocket.receive_text()
        ws_event = json.loads(ws_event_text)
        assert ws_event["type"] in ["FLOW_UPDATE", "FLOW_INGESTED", "ALERT_CREATED", "ALERT_TRIGGERED", "UNKNOWN_ATTACK"]
        assert "payload" in ws_event
        assert "timestamp" in ws_event

def test_websocket_ping_pong():
    """Verify WebSocket ping/pong responsiveness."""
    with client.websocket_connect("/ws") as websocket:
        _ = websocket.receive_text()  # initial status
        websocket.send_text("ping")
        pong_text = websocket.receive_text()
        pong = json.loads(pong_text)
        assert pong["type"] == "PONG"

def test_traffic_historical_trend_endpoint():
    """Verify GET /api/traffic/history computes time buckets from database."""
    for range_param in ["1H", "6H", "24H", "7D"]:
        resp = client.get(f"/api/traffic/history?range={range_param}")
        assert resp.status_code == 200
        data = resp.json()
        assert "points" in data
        assert "is_demo" in data
        assert isinstance(data["points"], list)
        assert len(data["points"]) > 0
        point = data["points"][0]
        assert "timestamp" in point
        assert "normal" in point
        assert "suspicious" in point
        assert "malicious" in point

def test_retention_policy_execution():
    """Verify retention maintenance endpoint executes cleanly."""
    resp = client.post("/api/traffic/maintenance/retention?hours=168")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert "records_pruned" in data
    assert "remaining_count" in data
    assert isinstance(data["records_pruned"], int)
