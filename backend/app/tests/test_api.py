import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "NER SmartLogistics AI" in data["platform"]
    assert data["status"] == "OPERATIONAL"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_auth_login_success():
    response = client.post("/api/v1/auth/login", json={
        "username_or_email": "superadmin@ner.gov.in",
        "password": "Admin@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "SUPER_ADMIN"
    assert data["email"] == "superadmin@ner.gov.in"

def test_auth_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={
        "username_or_email": "superadmin@ner.gov.in",
        "password": "WrongPassword999"
    })
    assert response.status_code == 401

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_monitored_segments"] > 0
    assert "safe_accessibility_pct" in data
    assert len(data["recent_alerts"]) > 0
    assert len(data["district_rankings"]) > 0

def test_list_states_and_districts():
    res_states = client.get("/api/v1/geo/states")
    assert res_states.status_code == 200
    states = res_states.json()
    assert len(states) == 8 # All 8 NER states
    state_names = [s["name"] for s in states]
    assert "Assam" in state_names
    assert "Sikkim" in state_names
    assert "Arunachal Pradesh" in state_names

    res_dist = client.get("/api/v1/geo/districts?state=Assam")
    assert res_dist.status_code == 200
    districts = res_dist.json()
    assert len(districts) > 0

def test_road_segments_and_filtering():
    response = client.get("/api/v1/geo/road-segments")
    assert response.status_code == 200
    segments = response.json()
    assert len(segments) > 0

    # Filter closed roads
    res_closed = client.get("/api/v1/geo/road-segments?status=CLOSED")
    assert res_closed.status_code == 200
    closed_segs = res_closed.json()
    assert len(closed_segs) > 0
    assert closed_segs[0]["current_status"] == "CLOSED"

def test_risk_aware_route_planning_closed_avoidance():
    # Route from Dimapur to Kohima (where NH-29 segment 2 is CLOSED due to landslide)
    payload = {
        "origin_name": "Dimapur Terminal",
        "origin_lat": 25.9068,
        "origin_lng": 93.7273,
        "destination_name": "Kohima Medical Center",
        "destination_lat": 25.6751,
        "destination_lng": 94.1086,
        "cargo_type": "MEDICINE",
        "avoid_high_risk": True,
        "alpha_time": 0.3,
        "beta_risk": 0.6,
        "gamma_dist": 0.1
    }
    response = client.post("/api/v1/routes/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["primary_route"] is not None
    # Crucial safety test: Route MUST NOT traverse closed roads
    assert data["primary_route"]["passes_closed_roads"] is False
    assert len(data["primary_route"]["path_coords"]) > 2

def test_incident_reporting_and_verification():
    # 1. Report new incident (Field officer)
    offline_id = "OFF-TEST-INC-999"
    new_inc = {
        "title": "Severe Flash Flood Obstruction on NH-37",
        "category": "FLOOD",
        "severity": "HIGH",
        "road_segment_id": "NER-RD-NH37-01",
        "lat": 26.2000,
        "lng": 91.9000,
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "description": "Flash water over topping culvert by 2 feet.",
        "reporter_name": "Field Officer Bikram",
        "offline_client_id": offline_id
    }
    res_create = client.post("/api/v1/incidents", json=new_inc)
    assert res_create.status_code == 200
    inc_data = res_create.json()
    assert inc_data["status"] == "REPORTED"
    inc_id = inc_data["id"]

    # Test offline sync idempotency: resending same offline_client_id returns same record
    res_dup = client.post("/api/v1/incidents", json=new_inc)
    assert res_dup.status_code == 200
    assert res_dup.json()["id"] == inc_id

    # 2. Verify incident (requires District Officer token)
    token = create_access_token(1) # Super admin has universal access
    verify_payload = {
        "status": "VERIFIED",
        "verification_notes": "Confirmed by ground team. Diverting traffic.",
        "update_road_segment": True,
        "new_road_status": "RESTRICTED"
    }
    res_verify = client.post(
        f"/api/v1/incidents/{inc_id}/verify",
        json=verify_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["status"] == "VERIFIED"

def test_ml_prediction_and_model_health():
    # 1. Check model health
    res_health = client.get("/api/v1/predictions/model-health")
    assert res_health.status_code == 200
    health = res_health.json()
    assert "model_name" in health
    assert health["forecast_horizon_hours"] == 24

    # 2. On-demand inference
    pred_payload = {
        "road_segment_id": "NER-RD-NH10-01",
        "forecast_horizon_hours": 24,
        "rainfall_current_mm": 120.0,
        "rainfall_antecedent_mm": 250.0,
        "soil_saturation_pct": 88.0
    }
    res_pred = client.post("/api/v1/predictions/predict", json=pred_payload)
    assert res_pred.status_code == 200
    data = res_pred.json()
    assert data["risk_probability"] > 0.0
    assert len(data["contributing_factors"]) > 0

def test_vehicle_tracking_and_anomaly_detection():
    # Ingest telemetry with stalled speed (0 km/h)
    telemetry_payload = {
        "lat": 26.1500,
        "lng": 91.7500,
        "speed_kmh": 0.0,
        "heading": 90.0
    }
    res = client.post("/api/v1/vehicles/AS-01-GB-4521/telemetry", json=telemetry_payload)
    assert res.status_code == 200
    v = res.json()
    assert v["current_speed_kmh"] == 0.0
    assert v["status"] == "STALLED"
    assert v["is_anomaly"] is True

def test_integrations_health():
    res = client.get("/api/v1/integrations/health")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 4
    source_names = [s["id"] for s in sources]
    assert "imd-weather" in source_names
    assert "sachet-cap" in source_names
    assert "bhuvan-isro" in source_names

