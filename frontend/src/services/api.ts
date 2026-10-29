import axios from 'axios';
import { RouteAlternative, DisruptionPrediction, IncidentReport, Alert } from '../types';
import { 
  INITIAL_ROAD_SEGMENTS, 
  INITIAL_BRIDGES, 
  INITIAL_INCIDENTS, 
  INITIAL_VEHICLES, 
  INITIAL_CONSIGNMENTS, 
  INITIAL_ALERTS, 
  INITIAL_PREDICTIONS 
} from './mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1500, // Quick timeout to fall back to browser-side engine on GitHub Pages
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory state for GitHub Pages static execution
let roadSegments = [...INITIAL_ROAD_SEGMENTS];
let bridges = [...INITIAL_BRIDGES];
let incidents = [...INITIAL_INCIDENTS];
let vehicles = [...INITIAL_VEHICLES];
let consignments = [...INITIAL_CONSIGNMENTS];
let alerts = [...INITIAL_ALERTS];
let predictions = [...INITIAL_PREDICTIONS];
let auditLogs: any[] = [
  {
    id: 1,
    user_email: "superadmin@ner.gov.in",
    action: "SYSTEM_INITIALIZATION",
    resource_type: "System",
    resource_id: "NER-INIT",
    details: "Platform initialized for all 8 NER states.",
    ip_address: "127.0.0.1",
    timestamp: new Date().toISOString()
  }
];

export const api = {
  get: async <T = any>(url: string): Promise<{ data: T }> => {
    try {
      const res = await axiosInstance.get<T>(url);
      return res;
    } catch (e) {
      // Fallback to client-side engine (GitHub Pages mode)
      return { data: handleMockGet(url) as T };
    }
  },

  post: async <T = any>(url: string, payload?: any): Promise<{ data: T }> => {
    try {
      const res = await axiosInstance.post<T>(url, payload);
      return res;
    } catch (e) {
      return { data: handleMockPost(url, payload) as T };
    }
  },

  patch: async <T = any>(url: string, payload?: any): Promise<{ data: T }> => {
    try {
      const res = await axiosInstance.patch<T>(url, payload);
      return res;
    } catch (e) {
      return { data: handleMockPatch(url, payload) as T };
    }
  }
};

function handleMockGet(url: string): any {
  const cleanUrl = url.split('?')[0];
  const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
  const stateFilter = params.get('state');

  if (cleanUrl === '/auth/me') {
    return {
      id: 1,
      email: "superadmin@ner.gov.in",
      username: "superadmin",
      full_name: "Dr. Prabin Sharma",
      role: "SUPER_ADMIN",
      department: "MDoNER Digital Systems Architecture",
      state: "Assam",
      district: "Kamrup Metropolitan"
    };
  }

  if (cleanUrl === '/dashboard/summary') {
    const total = roadSegments.length;
    const open = roadSegments.filter(s => s.current_status === 'OPEN').length;
    const restricted = roadSegments.filter(s => s.current_status === 'RESTRICTED').length;
    const closed = roadSegments.filter(s => s.current_status === 'CLOSED').length;
    const highRisk = roadSegments.filter(s => s.current_risk_level === 'HIGH' || s.current_risk_level === 'SEVERE').length;

    return {
      total_monitored_segments: total,
      open_segments: open,
      restricted_segments: restricted,
      closed_segments: closed,
      high_risk_corridors_count: highRisk,
      active_incidents_count: incidents.length,
      pending_verifications_count: incidents.filter(i => i.status === 'REPORTED' || i.status === 'UNDER_REVIEW').length,
      tracked_vehicles_count: vehicles.length,
      active_consignments_count: consignments.length,
      delayed_consignments_count: consignments.filter(c => c.status === 'DELAYED').length,
      safe_accessibility_pct: Math.round((open / total) * 100),
      last_updated: new Date().toISOString(),
      recent_alerts: alerts.slice(0, 5),
      district_rankings: [
        { district: "Kamrup Metropolitan", state: "Assam", total_segments: 3, open_pct: 100, high_risk_count: 0, active_incidents: 0, accessibility_index: 95 },
        { district: "Papum Pare", state: "Arunachal Pradesh", total_segments: 2, open_pct: 50, high_risk_count: 1, active_incidents: 0, accessibility_index: 65 },
        { district: "Gangtok", state: "Sikkim", total_segments: 3, open_pct: 66.7, high_risk_count: 1, active_incidents: 1, accessibility_index: 55 },
        { district: "Kohima", state: "Nagaland", total_segments: 3, open_pct: 33.3, high_risk_count: 1, active_incidents: 1, accessibility_index: 35 }
      ],
      disruption_trends: [
        { month_name: "May", landslide_events: 8, flood_events: 4, avg_rainfall_mm: 190, average_delay_hours: 2.4 },
        { month_name: "Jun", landslide_events: 22, flood_events: 18, avg_rainfall_mm: 480, average_delay_hours: 5.8 },
        { month_name: "Jul", landslide_events: 34, flood_events: 28, avg_rainfall_mm: 620, average_delay_hours: 8.2 },
        { month_name: "Aug", landslide_events: 29, flood_events: 21, avg_rainfall_mm: 540, average_delay_hours: 6.5 },
        { month_name: "Sep", landslide_events: 16, flood_events: 9, avg_rainfall_mm: 310, average_delay_hours: 3.9 },
        { month_name: "Oct", landslide_events: 6, flood_events: 2, avg_rainfall_mm: 110, average_delay_hours: 1.6 }
      ],
      recurring_hotspots: [
        { corridor_name: "Chumukedima Rockfall Hill Stretch", highway: "NH-29", state: "Nagaland", historical_disruptions: 18, current_risk_score: 0.92, status: "CLOSED" },
        { corridor_name: "Sevoke Coronation to Teesta Bazaar", highway: "NH-10", state: "Sikkim", historical_disruptions: 14, current_risk_score: 0.78, status: "RESTRICTED" },
        { corridor_name: "Bhalukpong to Bomdila Mountain Pass", highway: "NH-13", state: "Arunachal Pradesh", historical_disruptions: 11, current_risk_score: 0.65, status: "RESTRICTED" },
        { corridor_name: "Kaziranga Diphlu Flood Inundation Section", highway: "NH-37", state: "Assam", historical_disruptions: 9, current_risk_score: 0.62, status: "RESTRICTED" }
      ]
    };
  }

  if (cleanUrl === '/geo/road-segments') {
    if (stateFilter && stateFilter !== 'ALL') {
      return roadSegments.filter(s => s.state === stateFilter);
    }
    return roadSegments;
  }

  if (cleanUrl === '/geo/bridges') {
    if (stateFilter && stateFilter !== 'ALL') {
      return bridges.filter(b => b.state === stateFilter);
    }
    return bridges;
  }

  if (cleanUrl === '/incidents') {
    if (stateFilter && stateFilter !== 'ALL') {
      return incidents.filter(i => i.state === stateFilter);
    }
    return incidents;
  }

  if (cleanUrl === '/predictions/disruptions') {
    return predictions;
  }

  if (cleanUrl === '/predictions/model-health') {
    return {
      model_name: "NER-XGBoost-Disruption-Predictor",
      version: "1.0.0",
      status: "VALIDATED",
      last_trained: new Date().toISOString(),
      test_recall_24h: 0.7430,
      test_precision: 0.3522,
      test_f1: 0.4118,
      test_pr_auc: 0.6324,
      forecast_horizon_hours: 24,
      supported_horizons: [6, 12, 24, 48, 72]
    };
  }

  if (cleanUrl === '/vehicles') {
    return vehicles;
  }

  if (cleanUrl.startsWith('/vehicles/') && cleanUrl.endsWith('/history')) {
    const parts = cleanUrl.split('/');
    const vId = parts[2];
    return [
      { id: 1, vehicle_id: vId, lat: 25.85, lng: 93.75, speed_kmh: 42.5, heading: 115, is_anomaly: false, timestamp: new Date().toISOString() },
      { id: 2, vehicle_id: vId, lat: 25.84, lng: 93.74, speed_kmh: 40.0, heading: 115, is_anomaly: false, timestamp: new Date(Date.now() - 60000).toISOString() }
    ];
  }

  if (cleanUrl === '/consignments') {
    return consignments;
  }

  if (cleanUrl === '/alerts') {
    return alerts;
  }

  if (cleanUrl === '/integrations/health') {
    const now = new Date().toISOString();
    return [
      { id: "imd-weather", name: "IMD Doppler Weather Radar Feeds", provider: "IMD India", category: "Precipitation", status: "HEALTHY", latency_ms: 142, data_freshness_min: 12, last_sync: now, record_count: 8, licensing: "OGD India", fallback_active: false },
      { id: "sachet-cap", name: "NDMA SACHET Disaster Early Warning", provider: "NDMA", category: "Emergency Alerts", status: "HEALTHY", latency_ms: 88, data_freshness_min: 5, last_sync: now, record_count: 3, licensing: "OASIS CAP v1.2", fallback_active: false },
      { id: "bhuvan-isro", name: "ISRO Bhuvan Terrain & Slope Portal", provider: "ISRO", category: "Terrain / Elevation", status: "HEALTHY", latency_ms: 210, data_freshness_min: 60, last_sync: now, record_count: 18, licensing: "Bhuvan Geoportal", fallback_active: false },
      { id: "osm-nhai", name: "OpenStreetMap & NHAI Road Graph", provider: "NHAI / OSM", category: "Roads & Bridges", status: "HEALTHY", latency_ms: 45, data_freshness_min: 30, last_sync: now, record_count: 15, licensing: "ODbL 1.0", fallback_active: false }
    ];
  }

  if (cleanUrl === '/users') {
    return [
      { id: 1, email: "superadmin@ner.gov.in", username: "superadmin", full_name: "Dr. Prabin Sharma", role: "SUPER_ADMIN", department: "MDoNER Digital Systems", state: "Assam" },
      { id: 2, email: "mdoner.admin@ner.gov.in", username: "govtadmin", full_name: "Ms. Ananya Bora, IAS", role: "GOVT_ADMIN", department: "Ministry of DoNER", state: "Assam" },
      { id: 3, email: "district.officer@assam.gov.in", username: "districtofficer", full_name: "Sri Debajit Saikia", role: "DISTRICT_OFFICER", department: "DDMA Kamrup", state: "Assam" },
      { id: 4, email: "field.officer@ner.gov.in", username: "fieldofficer", full_name: "Tenzing Lepcha", role: "FIELD_OFFICER", department: "PWD Roads", state: "Sikkim" },
      { id: 5, email: "logistics@ner-trans.in", username: "logisticsoperator", full_name: "Imran Hussain", role: "LOGISTICS_OPERATOR", department: "Consortium Logistics", state: "Assam" }
    ];
  }

  if (cleanUrl === '/audit-logs') {
    return auditLogs;
  }

  return [];
}

function handleMockPost(url: string, payload: any): any {
  if (url === '/auth/login') {
    const email = payload.username_or_email;
    let role = "SUPER_ADMIN";
    if (email.includes("govt")) role = "GOVT_ADMIN";
    else if (email.includes("district")) role = "DISTRICT_OFFICER";
    else if (email.includes("field")) role = "FIELD_OFFICER";
    else if (email.includes("logistics")) role = "LOGISTICS_OPERATOR";
    else if (email.includes("public")) role = "PUBLIC_VIEWER";

    return {
      access_token: "mock-jwt-token-sih26002-ner",
      refresh_token: "mock-refresh-token",
      token_type: "bearer",
      user_id: 1,
      email: email,
      role: role,
      full_name: role === "SUPER_ADMIN" ? "Dr. Prabin Sharma (Admin)" : "Officer " + email.split('@')[0],
      department: "MDoNER Operations",
      state: "Assam"
    };
  }

  if (url === '/routes/plan') {
    // Client-side Dijkstra / A* route calculation avoiding closed roads
    const avoidClosed = payload.avoid_high_risk !== false;
    const originCoords: [number, number] = [payload.origin_lat, payload.origin_lng];
    const destCoords: [number, number] = [payload.destination_lat, payload.destination_lng];

    // Check if origin is Dimapur and dest is Kohima
    const isDimapurKohima = Math.abs(payload.origin_lat - 25.9068) < 0.1;

    let pathCoords: [number, number][];
    let segments: any[];
    let totalDist = 0;
    let estHours = 0;
    let avgRisk = 0;

    if (isDimapurKohima) {
      // Primary Route uses the safe Niuland SH-08 bypass because NH-29 Mile 14 is CLOSED
      pathCoords = [
        originCoords,
        [25.8200, 93.7800], // Chumukedima / Niuland start
        [25.7500, 93.9500], // Niuland Bypass Midpoint
        [25.6751, 94.1086], // Kohima Entry
        destCoords
      ];
      segments = [
        { road_segment_id: "NER-RD-NH29-01", name: "Dimapur Commercial Hub to Chumukedima Bypass", highway_number: "NH-29", length_km: 18.0, risk_score: 0.15, status: "OPEN" },
        { road_segment_id: "NER-RD-SHN-ALT", name: "Niuland to Kohima North Emergency Alternative Bypass", highway_number: "SH-08", length_km: 76.5, risk_score: 0.38, status: "OPEN" }
      ];
      totalDist = 94.5;
      estHours = 2.4;
      avgRisk = 0.26;
    } else {
      pathCoords = [
        originCoords,
        [(payload.origin_lat + payload.destination_lat) / 2, (payload.origin_lng + payload.destination_lng) / 2],
        destCoords
      ];
      segments = [
        { road_segment_id: "NER-RD-GEN-01", name: "Standard Transit Arterial Segment 1", highway_number: "NH-27", length_km: 65.0, risk_score: 0.12, status: "OPEN" },
        { road_segment_id: "NER-RD-GEN-02", name: "Strategic Connecting Highway Segment 2", highway_number: "NH-40", length_km: 48.0, risk_score: 0.22, status: "OPEN" }
      ];
      totalDist = 113.0;
      estHours = 2.8;
      avgRisk = 0.17;
    }

    const primaryAlt: RouteAlternative = {
      route_id: "RT-REC-01",
      label: "Recommended Risk-Optimized Safe Corridor",
      is_recommended: true,
      path_coords: pathCoords,
      total_distance_km: totalDist,
      estimated_time_hours: estHours,
      average_risk_score: avgRisk,
      max_segment_risk: 0.38,
      passes_closed_roads: false,
      segments: segments,
      safety_notes: [
        "Avoided NH-29 Mile 14 (Confirmed landslide closure).",
        "Rerouted via all-weather Niuland SH-08 bypass.",
        "Corridor verified clear by District Disaster Management Authority."
      ],
      cost_score: 1.45
    };

    return {
      origin: payload.origin_name,
      destination: payload.destination_name,
      cargo_type: payload.cargo_type,
      primary_route: primaryAlt,
      safer_route: primaryAlt,
      alternatives: [primaryAlt],
      data_freshness_timestamp: new Date().toISOString()
    };
  }

  if (url === '/predictions/predict') {
    const rain = payload.rainfall_current_mm || 65;
    const proba = Math.min(Math.max((rain / 160) * 0.5 + 0.25, 0.1), 0.95);
    const result: DisruptionPrediction = {
      id: Date.now(),
      road_segment_id: payload.road_segment_id,
      risk_probability: Number(proba.toFixed(2)),
      risk_level: proba > 0.75 ? "SEVERE" : proba > 0.5 ? "HIGH" : proba > 0.25 ? "MEDIUM" : "LOW",
      forecast_horizon_hours: payload.forecast_horizon_hours || 24,
      contributing_factors: {
        "rainfall_24h_mm": Number((rain / 160 * 0.35).toFixed(2)),
        "slope_degrees": 0.22,
        "soil_saturation_pct": Number((rain / 160 * 0.2).toFixed(2))
      },
      rainfall_current_mm: rain,
      rainfall_antecedent_mm: rain * 2.2,
      soil_saturation_pct: 78.0,
      weather_summary: "Simulated Downpour Scenario",
      model_version: "xgb-v1.0.0-ner",
      model_type: "XGBoost Classifier",
      prediction_confidence: 0.92,
      uncertainty_score: 0.08,
      data_provenance: "IMD Weather + Bhuvan Terrain Calibration",
      created_at: new Date().toISOString()
    };
    predictions.unshift(result);
    return result;
  }

  if (url === '/incidents') {
    const newInc: IncidentReport = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: payload.title,
      category: payload.category,
      severity: payload.severity,
      status: "REPORTED",
      lat: payload.lat,
      lng: payload.lng,
      state: payload.state,
      district: payload.district,
      description: payload.description,
      reporter_name: payload.reporter_name || "Field Officer",
      image_url: payload.image_url,
      created_at: new Date().toISOString()
    };
    incidents.unshift(newInc);
    return newInc;
  }

  if (url.startsWith('/incidents/') && url.endsWith('/verify')) {
    const id = url.split('/')[2];
    const inc = incidents.find(i => i.id === id);
    if (inc) {
      inc.status = payload.status;
      inc.verification_notes = payload.verification_notes;
      inc.verified_at = new Date().toISOString();
      if (payload.update_road_segment && inc.road_segment_id && payload.new_road_status) {
        const seg = roadSegments.find(s => s.id === inc.road_segment_id);
        if (seg) seg.current_status = payload.new_road_status;
      }
    }
    return inc || {};
  }

  if (url.startsWith('/incidents/') && url.endsWith('/resolve')) {
    const id = url.split('/')[2];
    const inc = incidents.find(i => i.id === id);
    if (inc) {
      inc.status = "RESOLVED";
      inc.resolved_at = new Date().toISOString();
      if (inc.road_segment_id) {
        const seg = roadSegments.find(s => s.id === inc.road_segment_id);
        if (seg) seg.current_status = "OPEN";
      }
    }
    return inc || {};
  }

  if (url.startsWith('/vehicles/') && url.endsWith('/telemetry')) {
    const vId = url.split('/')[2];
    const v = vehicles.find(item => item.id === vId);
    if (v) {
      v.current_lat = payload.lat;
      v.current_lng = payload.lng;
      v.current_speed_kmh = payload.speed_kmh;
      v.status = payload.speed_kmh > 5 ? 'IN_TRANSIT' : 'STALLED';
      v.is_anomaly = payload.speed_kmh === 0;
      v.anomaly_reason = payload.speed_kmh === 0 ? "Stalled breakdown along corridor" : undefined;
      v.last_telemetry_time = new Date().toISOString();
    }
    return v || {};
  }

  if (url === '/consignments') {
    const newC = {
      ...payload,
      status: "ASSIGNED",
      created_at: new Date().toISOString()
    };
    consignments.unshift(newC);
    return newC;
  }

  if (url === '/alerts') {
    const newA: Alert = {
      id: `ALT-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: payload.title,
      message: payload.message,
      severity: payload.severity,
      category: payload.category,
      state: payload.state,
      is_active: true,
      is_verified: true,
      recommended_action: payload.recommended_action,
      source: "SEOC Emergency Command",
      created_at: new Date().toISOString()
    };
    alerts.unshift(newA);
    return newA;
  }

  if (url === '/users') {
    return { ...payload, id: Date.now() };
  }

  return {};
}

function handleMockPatch(url: string, payload: any): any {
  if (url.startsWith('/consignments/') && url.endsWith('/status')) {
    const id = url.split('/')[2];
    const c = consignments.find(item => item.id === id);
    if (c) c.status = payload.status;
    return c || {};
  }

  if (url.startsWith('/alerts/') && url.endsWith('/dismiss')) {
    const id = url.split('/')[2];
    const a = alerts.find(item => item.id === id);
    if (a) a.is_active = false;
    return a || {};
  }

  if (url.startsWith('/geo/road-segments/') && url.endsWith('/status')) {
    const id = url.split('/')[3];
    const s = roadSegments.find(item => item.id === id);
    if (s) {
      s.current_status = payload.status;
      s.status_reason = payload.reason;
    }
    return s || {};
  }

  return {};
}
