import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "traffic_stats" in data
    assert data["kpis"]["total_flows"] > 0

def test_zero_day_endpoints():
    response = client.get("/api/zero-day")
    assert response.status_code == 200
    threats = response.json()
    assert isinstance(threats, list)
    if threats:
        single = client.get(f"/api/zero-day/{threats[0]['incident_id']}")
        assert single.status_code == 200

def test_xai_endpoints():
    response = client.get("/api/xai/INC-00142/shap")
    assert response.status_code == 200
    shap_data = response.json()
    assert "features" in shap_data
    assert len(shap_data["features"]) > 0

    response_lime = client.get("/api/xai/INC-00142/lime")
    assert response_lime.status_code == 200
    assert "reasons" in response_lime.json()

    response_rel = client.get("/api/xai/INC-00142/reliability")
    assert response_rel.status_code == 200
    assert response_rel.json()["stability_score"] >= 70

def test_sdn_status():
    response = client.get("/api/sdn/status")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["is_online"], bool)
    assert data["openflow_status"] in ["ACTIVE", "DISCONNECTED"]
