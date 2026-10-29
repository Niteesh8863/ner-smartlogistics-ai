# NER SmartLogistics AI — System Architecture Document
**Smart India Hackathon 2026 • Problem Statement SIH26002**  
*Ministry of Development of North Eastern Region (MDoNER)*

---

## 1. System Overview

**NER SmartLogistics AI** is a multi-tier, resilience-focused geospatial intelligence and decision-support platform designed to maintain logistical continuity across the eight North Eastern Region (NER) states of India: **Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura**.

The platform is designed around the core operational tenet:
> *"Know about a potential road disruption before a vehicle reaches it, recommend safer routes, and help government officials coordinate essential-goods deliveries using reliable, explainable information."*

```
                                  +-------------------------------------------------------------+
                                  |                 PRESENTATION & FIELD TIER                   |
                                  |  React 18 + Vite + TypeScript + Tailwind CSS + Leaflet GIS  |
                                  |  Installable Progressive Web App (PWA) with Service Worker  |
                                  |  Offline Incident Queue via IndexedDB (idb v8)              |
                                  +------------------------------+------------------------------+
                                                                 | REST / HTTPS (JSON)
                                                                 v
                                  +-------------------------------------------------------------+
                                  |               SECURITY & API GATEWAY TIER                   |
                                  |  FastAPI Framework with OpenAPI v3.1 (/api/v1)              |
                                  |  OAuth2 / JWT Token Authenticator + PBKDF2 Password Hashing |
                                  |  Role-Based Access Control (RBAC): 6 Distinct User Roles    |
                                  |  Immutable Audit Log Interceptor & Rate Limiting            |
                                  +--------------+------------------------------+---------------+
                                                 |                              |
                   +-----------------------------+                              +-------------------------------+
                   v                                                                                            v
+------------------------------------+                                                      +-----------------------------------+
|      AI/ML & ANALYTICS ENGINE      |                                                      |      INTEGRATION & ALERTS TIER    |
| • Tabular XGBoost Disruption Model |                                                      | • IMD Meteorological Adapter      |
| • SHAP Feature Explainability Tree |                                                      | • NDMA SACHET CAP v1.2 Protocol   |
| • NetworkX Directed Multi-Cost Graph|                                                     | • ISRO Bhuvan / Bhukosh Terrain   |
| • Isolation Forest Anomaly Detector|                                                      | • NHAI / OSM Road Network Graph   |
| • Haversine Geofence Verification  |                                                      | • Deduplication Notification Engine|
+------------------+-----------------+                                                      +-------------------+---------------+
                   |                                                                                            |
                   +------------------------------------+-------------------------------------------------------+
                                                        v
                                  +-------------------------------------------------------------+
                                  |                   DATA PERSISTENCE TIER                     |
                                  | • PostgreSQL 15 + PostGIS Spatial Indexing (Production)     |
                                  | • Self-Contained SQLite Engine (Instant Zero-Config Demo)   |
                                  | • Redis 7 In-Memory Telemetry Cache                         |
                                  +-------------------------------------------------------------+
```

---

## 2. Multi-Objective Routing Engine Architecture

The routing algorithm implements Dijkstra's and A* search over an edge-weighted directed road graph $G = (V, E)$, optimizing a composite cost function:

$$\text{Cost}(e) = \alpha \cdot \widetilde{T}(e) + \beta \cdot \widetilde{R}(e) + \gamma \cdot \widetilde{D}(e)$$

Where:
- $\widetilde{T}(e) \in [0, 1]$ is the normalized estimated travel time in hours.
- $\widetilde{R}(e) \in [0, 1]$ is the disruption probability estimated by the XGBoost pipeline.
- $\widetilde{D}(e) \in [0, 1]$ is the normalized segment length in kilometers.
- $\alpha, \beta, \gamma \ge 0$ such that $\alpha + \beta + \gamma = 1.0$.

### Strict Safety Pruning Rule
Safety constraints are modeled distinctly from weighted preferences:
$$\forall e \in E, \quad \text{Status}(e) = \text{CLOSED} \implies \text{Cost}(e) = \infty$$
Under no circumstances does the engine route through a confirmed closed road, regardless of distance or time savings.

---

## 3. Data Integration & Resilient Fallback Layer

| External Source | Real-world Constraints | Platform Engineering Solution |
| :--- | :--- | :--- |
| **IMD Doppler Radar / Gridded Weather** | Nodal clearance required for live commercial endpoints. | Pluggable `IMDWeatherAdapter` with graceful fallback to cached regional monsoon climatology. |
| **NDMA SACHET CAP** | Strict XML certificate validation. | OASIS CAP v1.2 compliant parser with built-in test fixtures for flood and landslide bulletins. |
| **ISRO Bhuvan Geoportal** | WMS/WFS internal tokens. | Pre-calculated 30m digital elevation model (DEM) slope and elevation layers. |
| **NHAI / State PWD Roads** | Fragmented departmental reporting. | Real-world surveyed coordinates for major lifelines (NH-10, NH-27, NH-29, NH-37, NH-102, NH-208, NH-13). |

---

## 4. Government Cloud Deployment Roadmap (MeghRaj)

1. **Docker Containerization**: Portable backend and frontend containers adhering to Ministry of Electronics and Information Technology (MeitY) guidelines.
2. **PostgreSQL/PostGIS Enterprise Tier**: High-availability clustering with spatial GiST indexing (`ST_DWithin`, `ST_Distance`).
3. **Auditability & SAIF Compliance**: Immutable event logging with IP, timestamp, and user provenance for every status update or verification.

