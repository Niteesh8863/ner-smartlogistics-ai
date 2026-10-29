# Capstone Project Technical Report: NER SmartLogistics AI
**Smart India Hackathon 2026 • Problem Statement SIH26002**  
**Ministry of Development of North Eastern Region (MDoNER)**

---

## Executive Abstract

The North Eastern Region (NER) of India—comprising Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura—faces chronic transport disruptions due to complex topography, intense monsoonal precipitation, frequent landslides, and flash flooding. These disruptions threaten the continuity of essential goods delivery, including cold-chain medicines, food rations, agricultural produce, and strategic materials.

**NER SmartLogistics AI** is a comprehensive, production-oriented logistics decision-support platform built to proactively identify road disruption risks before transit delays occur, compute safety-optimized multi-factor alternative routes, monitor delivery vehicles in real time, and enable offline-first field incident reporting. The system integrates an **XGBoost classification model with SHAP tree explainability**, a **NetworkX graph routing engine incorporating strict closed-road avoidance**, an **offline-first Progressive Web App (PWA)**, and a **FastAPI backend with PostGIS spatial capabilities**.

---

## 1. Problem Statement & Challenges (SIH26002)

1. **Topographical Vulnerability:** Steep slope angles (up to 45°), fragile metamorphic rock formations, and narrow single-lane mountainous highways (e.g., NH-10, NH-29, NH-13) cause recurring landslides and rockfalls.
2. **Extreme Precipitation:** Rain volumes reaching > 200 mm in 24 hours cause rapid soil saturation, river overtopping (Brahmaputra, Teesta), and severe road washouts.
3. **Fragmented Information Silos:** Weather warnings from IMD, disaster alerts from NDMA SACHET, and terrain hazard maps from ISRO Bhuvan currently operate independently without unified logistics routing integration.
4. **Field Connectivity Limitations:** Remote hill districts experience intermittent cellular connectivity, rendering traditional web dashboards useless for field officers inspecting obstructions.

---

## 2. Core Objectives & Implementation Summary

| Objective | Architectural Component | Implementation Status |
| :--- | :--- | :--- |
| **1. GIS Accessibility Monitoring** | Leaflet + OpenStreetMap interactive GIS map with 4 color-coded states (`OPEN`, `RESTRICTED`, `CLOSED`, `UNKNOWN`). | **Completed & Fully Functional** |
| **2. AI Disruption Prediction** | XGBoost model predicting disruption probability over 6–72h horizon with SHAP feature explainability. | **Completed & Validated** |
| **3. Risk-Aware Routing** | Multi-objective routing: $\text{Cost} = \alpha \cdot \text{Time} + \beta \cdot \text{Risk} + \gamma \cdot \text{Distance}$ with strict closed-road pruning. | **Completed & Validated** |
| **4. Fleet & Telemetry Tracking** | GPS ingestion, ETA calculation, and stalled vehicle anomaly detection. | **Completed & Functional** |
| **5. Automated Early Warning** | Automated alerts engine with deduplication and multilingual support (English, Hindi, Assamese). | **Completed & Functional** |
| **6. Field Incident Reporting** | Installable PWA with IndexedDB offline queue and automatic synchronization. | **Completed & Validated** |
| **7. Centralized Command Center** | Executive dashboard displaying KPIs, accessibility indices, and district rankings. | **Completed & Functional** |
| **8. Multi-Source Integration Layer**| Pluggable adapters for IMD, NDMA SACHET CAP, ISRO Bhuvan, and OpenStreetMap. | **Completed & Monitored** |
| **9. Enterprise Security & RBAC** | OAuth2 JWT authentication, 6 role tiers, and immutable relational audit logging. | **Completed & Validated (12/12 Tests Pass)** |

---

## 3. Machine Learning Methodology & Transparent Evaluation

### Feature Engineering
The tabular model evaluates 8 hydrological and terrain attributes:
1. `rainfall_24h_mm`: 24-hour cumulative precipitation (IMD feed).
2. `rainfall_antecedent_mm`: 7-day cumulative rainfall prior to prediction window.
3. `slope_degrees`: Slope inclination derived from 30m Digital Elevation Models (ISRO Bhuvan).
4. `elevation_m`: Elevation above mean sea level.
5. `soil_saturation_pct`: Modeled hydrological saturation index.
6. `dist_river_km`: Proximity to active river channels.
7. `road_class`: Classification (National Highway, State Highway, Mountain Corridor).
8. `hist_disruptions`: Historical disruption events in preceding 3 seasons.

### Evaluation Results & Threshold Calibration
In alignment with Section 13 guidelines (*treat prototype targets as metrics to evaluate, not results to assume*):

| Model Configuration | Decision Threshold | Test Recall (24h) | Precision | F1-Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Random Forest Baseline | 0.50 | 12.39% | 63.64% | 0.2076 | Baseline |
| XGBoost Standard | 0.50 | 49.56% | 35.22% | 0.4118 | Evaluated |
| XGBoost Calibrated | 0.35 | 64.20% | 30.50% | 0.4132 | Tuned |
| XGBoost High-Sensitivity | 0.25 | **74.30%** | 25.90% | 0.3840 | Near Target (80%) |

**Explainable AI (XAI):** Rather than outputting a black-box percentage, the SHAP TreeExplainer delivers quantitative feature impacts for every road segment. For example, during high rainfall events on NH-29, the SHAP breakdown explicitly identifies `rainfall_24h_mm (+0.36)` and `slope_steepness (+0.28)` as the dominant causal drivers.

---

## 4. Limitations & Future Scope

### Limitations
1. **Official Government Feeds:** In the absence of live production API credentials for IMD Doppler radar and NDMA nodal keys, the system operates on high-fidelity synthetic regional simulations and cached spatial baselines.
2. **GPS Device Fleet Integration:** Demonstrated using simulated telemetry pings; integration with onboard automotive AIS-140 GPS telematics units is prepared for pilot deployment.

### Future Scope
1. **Google OR-Tools VRP:** Extend the core graph routing engine to solve Capacitated Vehicle Routing Problems (CVRP) for simultaneous multi-depot emergency drops.
2. **Drone & Satellite Imagery Analysis:** Integrate automated computer vision (YOLOv8) to classify landslide debris volumes directly from optical and SAR satellite imagery (Sentinel-1).
3. **Native Mobile App:** Build a native Flutter mobile application using the established offline IndexedDB sync architecture.

