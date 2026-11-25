import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_login_flow():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "any"})
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["role"] == "ADMIN"

def test_rbac_mitigation_restriction_for_non_admin():
    # Generate analyst token
    analyst_token = create_access_token({"sub": "analyst", "role": "ANALYST"})
    headers = {"Authorization": f"Bearer {analyst_token}"}
    
    # Attempting mitigation with non-admin token must return 403 Forbidden
    response = client.post(
        "/api/mitigation/approve",
        headers=headers,
        json={"incident_id": "INC-00142", "action": "BLOCK_FLOW", "duration_sec": 3600}
    )
    assert response.status_code == 403
    assert "FORBIDDEN" in response.json()["detail"]
