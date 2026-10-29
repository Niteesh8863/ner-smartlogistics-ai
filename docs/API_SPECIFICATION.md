# NER SmartLogistics AI — REST API Specification
**Version:** 1.0.0  
**Base URL:** `/api/v1`

---

## 1. Authentication & Session Management

### `POST /auth/login`
- **Description:** Authenticates user credentials and returns short-lived JWT access token & long-lived refresh token.
- **Request Body:**
  ```json
  {
    "username_or_email": "superadmin@ner.gov.in",
    "password": "Admin@12345"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "refresh_token": "eyJhbGciOi...",
    "user_id": 1,
    "email": "superadmin@ner.gov.in",
    "role": "SUPER_ADMIN",
    "full_name": "Dr. Prabin Sharma",
    "department": "MDoNER Digital Systems Architecture"
  }
  ```

---

## 2. Command Center Dashboard

### `GET /dashboard/summary`
- **Query Parameters:** `state` (optional), `district` (optional)
- **Response (200 OK):**
  ```json
  {
    "total_monitored_segments": 14,
    "open_segments": 9,
    "restricted_segments": 4,
    "closed_segments": 1,
    "high_risk_corridors_count": 4,
    "active_incidents_count": 3,
    "tracked_vehicles_count": 4,
    "active_consignments_count": 3,
    "delayed_consignments_count": 1,
    "safe_accessibility_pct": 64.3,
    "recent_alerts": [...],
    "district_rankings": [...]
  }
  ```

---

## 3. Geospatial & Road Network

### `GET /geo/road-segments`
- **Query Parameters:** `state`, `district`, `status` (`OPEN`, `RESTRICTED`, `CLOSED`), `risk_level` (`LOW`, `MEDIUM`, `HIGH`, `SEVERE`)
- **Response (200 OK):** Array of `RoadSegment` objects.

### `PATCH /geo/road-segments/{id}/status`
- **Authorized Roles:** `DISTRICT_OFFICER`, `GOVT_ADMIN`, `SUPER_ADMIN`
- **Request Body:**
  ```json
  {
    "status": "RESTRICTED",
    "reason": "Single lane operation due to rockfall clearance near 29th Mile"
  }
  ```

---

## 4. Multi-Objective Route Optimization

### `POST /routes/plan`
- **Request Body:**
  ```json
  {
    "origin_name": "Dimapur Commercial Rail Yard",
    "origin_lat": 25.9068,
    "origin_lng": 93.7273,
    "destination_name": "Kohima Civil Hospital",
    "destination_lat": 25.6751,
    "destination_lng": 94.1086,
    "cargo_type": "MEDICINE",
    "alpha_time": 0.30,
    "beta_risk": 0.60,
    "gamma_dist": 0.10
  }
  ```
- **Response (200 OK):** Contains `primary_route`, `safer_route`, turn-by-turn segment details, total distance, travel time, and safety advisories.

---

## 5. Field Incidents & Offline Synchronization

### `POST /incidents`
- **Description:** Submit geotagged field report. Supports `offline_client_id` for idempotent duplicate protection during reconnection.
- **Request Body:**
  ```json
  {
    "title": "Mudslide on Chumukedima Hill",
    "category": "LANDSLIDE",
    "severity": "CRITICAL",
    "lat": 25.7500,
    "lng": 93.9200,
    "state": "Nagaland",
    "district": "Kohima",
    "description": "150m debris blocking both carriageways.",
    "reporter_name": "Field Officer Vilie",
    "offline_client_id": "OFF-REP-NAG-2026-99"
  }
  ```

### `POST /incidents/{id}/verify`
- **Authorized Roles:** `DISTRICT_OFFICER`, `GOVT_ADMIN`, `SUPER_ADMIN`
- **Request Body:**
  ```json
  {
    "status": "VERIFIED",
    "verification_notes": "Ground verification complete. Diverting traffic.",
    "update_road_segment": true,
    "new_road_status": "CLOSED"
  }
  ```

---

## 6. AI Disruption Predictions & SHAP Inferences

### `POST /predictions/predict`
- **Description:** On-demand inference and SHAP explainability computation.
- **Request Body:**
  ```json
  {
    "road_segment_id": "NER-RD-NH10-01",
    "forecast_horizon_hours": 24,
    "rainfall_current_mm": 120.0,
    "rainfall_antecedent_mm": 240.0,
    "soil_saturation_pct": 85.0
  }
  ```

