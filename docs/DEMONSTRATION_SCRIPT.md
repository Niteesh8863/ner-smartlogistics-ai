# NER SmartLogistics AI — Demonstration Script & Presentation Walkthrough
**SIH 2026 Problem Statement SIH26002**

---

## Demonstration Overview (7 Minutes Total)

This script outlines the exact sequence to present **NER SmartLogistics AI** to the evaluation panel, demonstrating working full-stack functionality across all 9 objectives.

---

### Step 1: Authentication & Role-Based Access Control (1 Minute)
1. Open the application at `http://localhost:5173`.
2. Notice the clean, official light-theme government interface.
3. Show the **Quick Role Demonstration Accounts**:
   - `superadmin@ner.gov.in` (Super Admin)
   - `mdoner.admin@ner.gov.in` (Govt Admin)
   - `district.officer@assam.gov.in` (District Officer)
   - `field.officer@ner.gov.in` (Field Officer)
   - `logistics@ner-trans.in` (Logistics Operator)
4. Log in as **Super Administrator**. Explain that RBAC is enforced on the backend via OAuth2 JWT tokens.

---

### Step 2: Government Command Center (1.5 Minutes)
1. Navigate to the **Command Center** (`/`).
2. Highlight the top KPIs: Total Monitored Segments, Open vs. Restricted vs. Closed Roads, Tracked Fleet, and Active Consignments.
3. Demonstrate regional filtering: select **Nagaland** from the top Region dropdown.
   - Observe how the metrics dynamically update: NH-29 Chumukedima is flagged as **CLOSED**.
4. Point out the **District-Level Accessibility Index** and the **Monsoonal Disruption Trend Patterns** correlating rainfall with delay hours.

---

### Step 3: Interactive GIS Accessibility Map (1.5 Minutes)
1. Navigate to **GIS Accessibility Map** (`/map`).
2. Show the color-coded road network:
   - Green: Open highways (e.g., NH-27 Guwahati Expressway).
   - Amber: Restricted highways (e.g., NH-10 Sevoke-Teesta single-lane clearance).
   - Red: Closed highways (e.g., NH-29 Mile 14 landslide).
3. Click on the red NH-29 segment:
   - The **Segment Detail Drawer** opens on the right.
   - Explain the terrain properties: Elevation (1440m), Slope (32°), Soil Lithology (Unconsolidated Shale).
   - Show the **AI Disruption Probability Gauge (92% - SEVERE)**.

---

### Step 4: AI Disruption Prediction & SHAP Explainability (1 Minute)
1. Navigate to **AI Disruption Risk** (`/predictions`).
2. Show the prediction table with 6h to 72h horizons.
3. Use the **Interactive Environmental Scenario Simulator**:
   - Select `NER-RD-NH10-01` (Sikkim Lifeline).
   - Drag the simulated rainfall slider up to `140 mm`.
   - Click **Run AI Prediction**.
   - Show the real-time inference result and the **SHAP Waterfall breakdown**, proving that rainfall intensity (+0.34) and river proximity (+0.26) drove the risk escalation.

---

### Step 5: Risk-Aware Route Optimization & Closed-Road Avoidance (1 Minute)
1. Navigate to **Risk-Aware Routing** (`/routes`).
2. Set Origin: `Dimapur Commercial Rail Yard (Nagaland)` and Destination: `Kohima Civil Hospital`.
3. Set Cargo Type: `Medicines & Vaccines (Risk Averse - High Safety)`.
4. Click **Calculate Risk-Optimized Routes**.
5. Observe the result:
   - The direct route via NH-29 is strictly avoided because it is confirmed **CLOSED**.
   - The engine automatically routes via the **Niuland State Route SH-08 Emergency Bypass**.
   - Show the cost formula: $\text{Cost} = \alpha \cdot \text{Time} + \beta \cdot \text{Risk} + \gamma \cdot \text{Distance}$.

---

### Step 6: Fleet Telemetry & Stalled Anomaly Detection (30 Seconds)
1. Navigate to **Fleet & Telemetry** (`/vehicles`).
2. Select vehicle `NL-07-C-7744`.
3. Notice that its speed is 0.0 km/h and the system has flagged it with an **ANOMALY: Stalled near Chumukedima landslide approach**.
4. Click the simulator button: **Simulate Normal Transit (48 km/h)**.
5. Notice the status immediately recovers to **IN_TRANSIT** and normal flow is logged in the telemetry audit.

---

### Step 7: Offline-First Field Reporting (PWA) & Verification Lifecycle (1 Minute)
1. Navigate to **Field Incident Entry** (`/reporting`).
2. Simulate field disconnection (or explain the offline queue):
   - Fill in a report: *"Flash Flood Overwash on NH-37"*.
   - Click **Acquire Device GPS** to capture latitude/longitude.
   - Submit the report: show the instant confirmation that the report is captured.
3. Navigate to **Incident Verification** (`/verification`):
   - As District Officer, open the pending queue.
   - Review ground evidence photograph.
   - Click **Verify & Enforce Status** to officially update the road status and trigger an emergency alert.

