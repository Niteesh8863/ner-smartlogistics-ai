# NER SmartLogistics AI
### AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region (NER)
**Smart India Hackathon 2026 • Problem Statement SIH26002**  
*Associated Ministry: Ministry of Development of North Eastern Region (MDoNER)*

[![Live Web Application](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://niteesh8863.github.io/ner-smartlogistics-ai/)
[![Backend Test Suite](https://img.shields.io/badge/pytest-12%2F12%20passed-brightgreen.svg)]()
[![TypeScript Build](https://img.shields.io/badge/vite-compiled%20successfully-blue.svg)]()
[![Architecture](https://img.shields.io/badge/MeghRaj-Containerized%20Ready-purple.svg)]()

> 🌐 **Live Web Application URL:** [https://niteesh8863.github.io/ner-smartlogistics-ai/](https://niteesh8863.github.io/ner-smartlogistics-ai/)  
> 📦 **GitHub Repository:** [https://github.com/Niteesh8863/ner-smartlogistics-ai](https://github.com/Niteesh8863/ner-smartlogistics-ai)
[![Python](https://img.shields.io/badge/python-3.11%20%7C%203.14-blue.svg)]()
[![React](https://img.shields.io/badge/react-18.3-cyan.svg)]()

---

## 1. Executive Summary

The North Eastern Region (NER) of India—spanning **Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura**—faces severe logistical hurdles driven by steep mountainous terrain, seasonal flash flooding, heavy monsoon downpours, and recurrent landslides. These challenges delay the movement of medicines, food rations, agricultural produce, and disaster-relief materials.

**NER SmartLogistics AI** integrates meteorological feeds, terrain hazard layers, road networks, and vehicular telemetry into a unified decision-support platform designed to:
> **"Know about a potential road disruption before a vehicle reaches it, recommend safer routes, and help government officials coordinate essential-goods deliveries using reliable, explainable information."**

---

## 2. Technology Stack

- **Frontend Application:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **GIS Mapping:** Leaflet with OpenStreetMap tiles, custom color-coded status vectors, and interactive segment drawers.
- **Data Visualizations:** Recharts (accessibility indices, seasonal trends, and corridor breakdowns).
- **Offline Field App (PWA):** Progressive Web App with Service Worker asset caching and IndexedDB (`idb` v8) offline incident queueing and auto-sync.
- **Backend API & AI Engine:** Python FastAPI with async REST endpoints under `/api/v1` and auto-generated OpenAPI documentation.
- **Machine Learning & XAI:** XGBoost tabular classification, Random Forest baseline, and SHAP (TreeExplainer) feature contributions.
- **Risk-Aware Routing:** NetworkX directed graph modeling with multi-objective weighted cost:
  $$\text{Cost} = \alpha \cdot \text{Time} + \beta \cdot \text{DisruptionRisk} + \gamma \cdot \text{Distance}$$
- **Database & Persistence:** PostgreSQL 15 with PostGIS spatial extension (with self-contained SQLite fallback for instant zero-dependency execution), SQLAlchemy 2.0, and Redis cache.
- **Deployment:** Docker, Docker Compose, and MeghRaj GI Cloud compatibility.

---

## 3. Pre-Seeded Demonstration Accounts

| Role Tier | Email / Username | Password | Purpose & Scope |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `superadmin@ner.gov.in` | `Admin@12345` | Full system control, RBAC provisioning, audit logs. |
| **Government Administrator** | `mdoner.admin@ner.gov.in` | `Govt@12345` | MDoNER regional dashboard, corridor bottleneck planning. |
| **District Officer** | `district.officer@assam.gov.in`| `District@12345` | Ground incident verification, road status alteration. |
| **Field Officer** | `field.officer@ner.gov.in` | `Field@12345` | Mobile/PWA offline incident submission with photo capture. |
| **Logistics Operator** | `logistics@ner-trans.in` | `Logistics@12345` | Fleet telemetry, route planning, consignment status. |
| **Public Viewer** | `public@viewer.in` | `Public@12345` | Read-only public safety and road closure alerts. |

---

## 4. Quickstart Guide (Local Execution)

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm (Tested on Node v24.18.0)
- (Optional) Docker & Docker Compose

---

### Step 1: Backend Setup & Automated Seeding

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run initial database seeding (populates 8 states, highways, bridges, users, and scenarios)
python -m app.seed.seed_data

# Train the XGBoost Disruption Model & Fit SHAP Explainer
python -m app.ml.train_disruption

# Launch the FastAPI Server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be live at `http://localhost:8000`  
Interactive OpenAPI documentation: `http://localhost:8000/api/v1/docs`

---

### Step 2: Frontend Setup

In a separate terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Run the development server
npm run dev
```
Open your browser at `http://localhost:5173` to access the full platform.

---

### Step 3: Run Automated Test Suite

```bash
cd backend
python -m pytest app/tests/test_api.py -v
```
**Test Results:**
```text
====================== 12 passed, 0 failed in 13.38s ======================
app/tests/test_api.py::test_root_endpoint PASSED                         [  8%]
app/tests/test_api.py::test_health_endpoint PASSED                       [ 16%]
app/tests/test_api.py::test_auth_login_success PASSED                    [ 25%]
app/tests/test_api.py::test_auth_login_invalid_credentials PASSED        [ 33%]
app/tests/test_api.py::test_dashboard_summary PASSED                     [ 41%]
app/tests/test_api.py::test_list_states_and_districts PASSED             [ 50%]
app/tests/test_api.py::test_road_segments_and_filtering PASSED           [ 58%]
app/tests/test_api.py::test_risk_aware_route_planning_closed_avoidance PASSED [ 66%]
app/tests/test_api.py::test_incident_reporting_and_verification PASSED   [ 75%]
app/tests/test_api.py::test_ml_prediction_and_model_health PASSED        [ 83%]
app/tests/test_api.py::test_vehicle_tracking_and_anomaly_detection PASSED [ 91%]
app/tests/test_api.py::test_integrations_health PASSED                   [100%]
```

---

## 5. Dockerized Deployment

To launch the full enterprise stack with PostgreSQL 15, PostGIS, Redis, Backend, and Nginx Frontend:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost`
- Backend API: `http://localhost:8000/api/v1/docs`

---

## 6. Project Directory Layout

```text
ner-smartlogistics-ai/
├── README.md                          # Project documentation and quickstart
├── docker-compose.yml                 # PostGIS + Redis + Backend + Frontend containers
├── .env.example                       # Environment configuration template
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint and middleware
│   │   ├── core/                      # Config, security, DB sessions, audit interceptors
│   │   ├── models/                    # Normalized SQLAlchemy models (User, Spatial, Incident, Logistics)
│   │   ├── schemas/                   # Pydantic v2 validation contracts
│   │   ├── api/v1/                    # 12 Rest API endpoint routers
│   │   ├── services/                  # NetworkX routing engine & anomaly detector
│   │   ├── ml/                        # XGBoost training, SHAP explainer & artifacts
│   │   ├── seed/                      # Reproducible NER geospatial seed script
│   │   └── tests/                     # Automated pytest suite (12 passed)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── public/                        # PWA manifest & service worker
│   └── src/
│       ├── types/                     # TypeScript data interfaces
│       ├── context/                   # AuthContext with persistent RBAC
│       ├── services/                  # Axios client & IndexedDB offline store
│       ├── components/                # Navbar, Sidebar, Badges, RiskMeter
│       └── pages/                     # 15 Complete functional UI modules
└── docs/
    ├── ARCHITECTURE.md                # System design & MeghRaj cloud roadmap
    ├── API_SPECIFICATION.md           # REST API endpoints & schemas
    ├── SIH26002_CAPSTONE_REPORT.md    # Capstone technical report
    └── DEMONSTRATION_SCRIPT.md        # Jury walkthrough demonstration outline
```

---

## 7. Official Acknowledgements & Disclaimer

- **Associated Ministry:** Ministry of Development of North Eastern Region (MDoNER).
- **Hackathon:** Smart India Hackathon 2026 (Problem Statement SIH26002).
- **Disclaimer:** Developed as an advanced capstone prototype for SIH 2026. Data records for road closures, weather observations, and vehicular telemetry are synthetic and calibrated for research and demonstration purposes. Do not use as verified live emergency advisories without integration with official state disaster management authorities (SDMA/SEOC).
