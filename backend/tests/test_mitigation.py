import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_admin_approved_mitigation_workflow():
    # Admin token
    admin_token = create_access_token({"sub": "admin", "role": "ADMIN"})
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Authorize mitigation
    response = client.post(
        "/api/mitigation/approve",
        headers=headers,
        json={"incident_id": "INC-00142", "action": "BLOCK_FLOW", "duration_sec": 1800}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "audit_id" in res
    assert "BLOCK_FLOW" in res["message"]

    # 2. Check that incident status is updated in registry
    inc_res = client.get("/api/incidents/INC-00142")
    assert inc_res.status_code == 200
    inc_data = inc_res.json()["incident"]
    assert inc_data["status"] == "MITIGATED"
    assert inc_data["mitigation_status"] == "EXECUTED"
