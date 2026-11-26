import pytest
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from app.main import app as main_app
from app.core.security import create_access_token
from app.sdn.controller_client import SDNControllerClient
from app.sdn.flow_manager import SDNFlowManager
from app.services.mitigation_service import mitigation_service

client = TestClient(main_app)

# =====================================================================
# Standalone Mock Ryu OpenFlow 1.3 REST Controller Application
# =====================================================================

mock_ryu = FastAPI()

# In-memory switch flow table datastore simulating OpenFlow datapaths
DATAPATHS = {
    1: [
        {
            "priority": 1000,
            "table_id": 0,
            "match": {"eth_type": 2048, "ip_proto": 6, "tp_dst": 80},
            "actions": ["OUTPUT:2"],
            "packet_count": 4500,
            "byte_count": 320000,
            "duration_sec": 120.0,
            "hard_timeout": 0,
            "idle_timeout": 0,
        }
    ],
    2: [
        {
            "priority": 500,
            "table_id": 0,
            "match": {"eth_type": 2048, "nw_src": "10.0.0.99"},
            "actions": ["OUTPUT:1"],
            "packet_count": 120,
            "byte_count": 9600,
            "duration_sec": 15.0,
            "hard_timeout": 0,
            "idle_timeout": 0,
        }
    ],
}

@mock_ryu.get("/stats/switches")
async def ryu_get_switches():
    return list(DATAPATHS.keys())

@mock_ryu.get("/stats/desc/{dpid}")
async def ryu_get_desc(dpid: int):
    return {
        str(dpid): {
            "mfr_desc": "Open vSwitch / Mininet OFP1.3",
            "hw_desc": "Hardware Simulated",
            "sw_desc": "2.17.0",
            "serial_num": f"OVS-{dpid}",
            "dp_desc": "TestDatapath",
        }
    }

@mock_ryu.get("/stats/flow/{dpid}")
async def ryu_get_flow(dpid: int):
    return {str(dpid): DATAPATHS.get(dpid, [])}

@mock_ryu.post("/stats/flowentry/add")
async def ryu_add_flow(req: Request):
    payload = await req.json()
    dpid = payload.get("dpid", 1)
    if dpid not in DATAPATHS:
        DATAPATHS[dpid] = []
    
    # Commit rule to switch flow table
    DATAPATHS[dpid].append({
        "priority": payload.get("priority", 32768),
        "table_id": payload.get("table_id", 0),
        "match": payload.get("match", {}),
        "actions": payload.get("actions", []),
        "packet_count": 0,
        "byte_count": 0,
        "duration_sec": 0.0,
        "hard_timeout": payload.get("hard_timeout", 0),
        "idle_timeout": payload.get("idle_timeout", 0),
    })
    return JSONResponse(status_code=200, content={"status": "SUCCESS"})

@mock_ryu.post("/stats/flowentry/delete_strict")
async def ryu_delete_flow(req: Request):
    payload = await req.json()
    dpid = payload.get("dpid", 1)
    src_ip = payload.get("match", {}).get("nw_src")
    priority = payload.get("priority", 65535)

    if dpid in DATAPATHS:
        DATAPATHS[dpid] = [
            f for f in DATAPATHS[dpid]
            if not (f.get("priority") == priority and f.get("match", {}).get("nw_src") == src_ip)
        ]
    return JSONResponse(status_code=200, content={"status": "SUCCESS"})


# =====================================================================
# Unit & Integration Tests for SDN Controller and Mitigation
# =====================================================================

@pytest.mark.anyio
async def test_disconnected_controller_reports_honest_status():
    """Verify that when the SDN controller is unreachable, it reports DISCONNECTED with zero fake metrics."""
    # Point to an offline invalid port
    offline_client = SDNControllerClient(base_url="http://127.0.0.1:59998")
    status = await offline_client.get_status()
    
    assert status.is_online is False
    assert status.openflow_status == "DISCONNECTED"
    assert status.connected_switches == 0
    assert status.active_rules == 0
    assert status.latency_ms == 0.0
    assert "DISCONNECTED" in status.controller_name

@pytest.mark.anyio
async def test_disconnected_flow_manager_does_not_fabricate_success():
    """Ensure flow manager reports SIMULATION_MODE_DISCONNECTED when controller is unreachable."""
    offline_manager = SDNFlowManager(base_url="http://127.0.0.1:59998")
    res = await offline_manager.install_drop_rule(dpid="1", src_ip="198.51.100.44")
    
    assert res["status"] == "SIMULATION_MODE_DISCONNECTED"
    assert res["is_live_controller"] is False
    assert res["is_verified_on_switch"] is False
    assert "DISCONNECTED" in res["message"]

def test_api_sdn_status_endpoint():
    """Verify /api/sdn/status returns well-formed SDNStatusResponse."""
    resp = client.get("/api/sdn/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "is_online" in data
    assert "openflow_status" in data
    assert "connected_switches" in data

def test_api_sdn_switches_and_flows():
    """Verify /api/sdn/switches and /api/sdn/flows endpoints."""
    sw_resp = client.get("/api/sdn/switches")
    assert sw_resp.status_code == 200
    switches = sw_resp.json()
    assert isinstance(switches, list)
    assert len(switches) > 0
    assert "dpid" in switches[0]

    flow_resp = client.get("/api/sdn/flows")
    assert flow_resp.status_code == 200
    flows = flow_resp.json()
    assert isinstance(flows, list)
    assert len(flows) > 0
    assert "priority" in flows[0]

def test_mitigation_rbac_rejection_for_analyst():
    """Verify strict HTTP 403 Forbidden for non-admin users attempting mitigation."""
    analyst_token = create_access_token({"sub": "sec_analyst", "role": "ANALYST"})
    headers = {"Authorization": f"Bearer {analyst_token}"}
    
    res = client.post(
        "/api/mitigation/approve",
        headers=headers,
        json={"incident_id": "INC-00142", "action": "BLOCK_FLOW", "duration_sec": 1800}
    )
    assert res.status_code == 403
    assert "FORBIDDEN" in res.json()["detail"]

def test_admin_approved_mitigation_and_rollback():
    """
    Test complete Human-in-the-Loop mitigation workflow:
    1. Admin approves BLOCK_FLOW
    2. Audit record generated
    3. Incident status updated
    4. Admin executes rollback
    5. Incident updated to ROLLED_BACK
    """
    admin_token = create_access_token({"sub": "admin_chief", "role": "ADMIN"})
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Approve
    approve_res = client.post(
        "/api/mitigation/approve",
        headers=headers,
        json={"incident_id": "INC-00142", "action": "BLOCK_FLOW", "duration_sec": 3600}
    )
    assert approve_res.status_code == 200
    app_data = approve_res.json()
    assert app_data["success"] is True
    assert "audit_id" in app_data
    assert app_data["executed_action"] == "BLOCK_FLOW"

    # 2. Verify Incident state
    inc_res = client.get("/api/incidents/INC-00142")
    assert inc_res.status_code == 200
    incident = inc_res.json()["incident"]
    assert incident["status"] == "MITIGATED"
    assert incident["mitigation_status"] == "EXECUTED"

    # 3. Rollback
    rollback_res = client.post(
        "/api/mitigation/rollback",
        headers=headers,
        json={"incident_id": "INC-00142", "reason": "Attack traffic ceased; releasing block"}
    )
    assert rollback_res.status_code == 200
    rb_data = rollback_res.json()
    assert rb_data["success"] is True
    assert rb_data["executed_action"] == "ROLLBACK"

    # 4. Confirm Rollback status
    inc_rb_res = client.get("/api/incidents/INC-00142")
    assert inc_rb_res.status_code == 200
    incident_rb = inc_rb_res.json()["incident"]
    assert incident_rb["mitigation_status"] == "ROLLED_BACK"

def test_mitigation_rejection():
    """Verify administrator rejection of mitigation recommendation."""
    admin_token = create_access_token({"sub": "admin_chief", "role": "ADMIN"})
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    reject_res = client.post(
        "/api/mitigation/reject",
        headers=headers,
        json={"incident_id": "INC-00142", "reason": "False positive benign traffic spike"}
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["success"] is True
