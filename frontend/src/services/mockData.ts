import { RoadSegment, Bridge, IncidentReport, DisruptionPrediction, Vehicle, Consignment, Alert, RouteAlternative } from '../types';

export const INITIAL_ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: "NER-RD-NH10-01",
    highway_number: "NH-10",
    name: "Sevoke Coronation to Teesta Bazaar",
    start_lat: 26.8833, start_lng: 88.4667,
    end_lat: 27.0600, end_lng: 88.5000,
    state: "Sikkim", district: "Gangtok",
    length_km: 34.5, surface_type: "Paved Mountainous", road_class: "National Highway",
    current_status: "RESTRICTED", status_reason: "Single lane open due to rockfall clearance near 29th Mile",
    current_risk_score: 0.78, current_risk_level: "HIGH",
    elevation_m: 450.0, slope_degrees: 28.5, soil_type: "Schist/Gneiss Fragile", distance_to_river_km: 0.2,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH10-02",
    highway_number: "NH-10",
    name: "Teesta Bazaar to Rangpo Sikkim Border",
    start_lat: 27.0600, start_lng: 88.5000,
    end_lat: 27.1767, end_lng: 88.5283,
    state: "Sikkim", district: "Gangtok",
    length_km: 22.0, surface_type: "Paved Mountainous", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Clear passage with active monitoring",
    current_risk_score: 0.35, current_risk_level: "MEDIUM",
    elevation_m: 720.0, slope_degrees: 22.0, soil_type: "Metamorphic Rock", distance_to_river_km: 0.3,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH10-03",
    highway_number: "NH-10",
    name: "Rangpo to Gangtok Central Terminal",
    start_lat: 27.1767, start_lng: 88.5283,
    end_lat: 27.3389, end_lng: 88.6065,
    state: "Sikkim", district: "Gangtok",
    length_km: 38.2, surface_type: "Paved Heavy Duty", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Open for all commercial vehicles",
    current_risk_score: 0.18, current_risk_level: "LOW",
    elevation_m: 1650.0, slope_degrees: 15.0, soil_type: "Rocky Loam", distance_to_river_km: 1.2,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH40-01",
    highway_number: "NH-40",
    name: "Guwahati Khanapara to Nongpoh Expressway",
    start_lat: 26.1158, start_lng: 91.8217,
    end_lat: 25.9015, end_lng: 91.8797,
    state: "Meghalaya", district: "Ri-Bhoi",
    length_km: 52.0, surface_type: "4-Lane Divided Highway", road_class: "National Highway",
    current_status: "OPEN", status_reason: "High speed smooth flow",
    current_risk_score: 0.12, current_risk_level: "LOW",
    elevation_m: 480.0, slope_degrees: 8.0, soil_type: "Red Clay", distance_to_river_km: 3.0,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH40-02",
    highway_number: "NH-40",
    name: "Nongpoh to Umiam Lake & Shillong Gate",
    start_lat: 25.9015, start_lng: 91.8797,
    end_lat: 25.5788, end_lng: 91.8933,
    state: "Meghalaya", district: "East Khasi Hills",
    length_km: 47.5, surface_type: "4-Lane Mountain Expressway", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Safe with fog advisories",
    current_risk_score: 0.22, current_risk_level: "LOW",
    elevation_m: 1520.0, slope_degrees: 14.2, soil_type: "Laterite Rock", distance_to_river_km: 1.8,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH29-01",
    highway_number: "NH-29",
    name: "Dimapur Commercial Hub to Chumukedima Bypass",
    start_lat: 25.9068, start_lng: 93.7273,
    end_lat: 25.8200, end_lng: 93.7800,
    state: "Nagaland", district: "Dimapur",
    length_km: 18.0, surface_type: "Paved 4-Lane", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Normal freight movement",
    current_risk_score: 0.15, current_risk_level: "LOW",
    elevation_m: 195.0, slope_degrees: 4.5, soil_type: "Alluvial", distance_to_river_km: 0.8,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH29-02",
    highway_number: "NH-29",
    name: "Chumukedima Rockfall Zone to Kohima Entry",
    start_lat: 25.8200, start_lng: 93.7800,
    end_lat: 25.6751, end_lng: 94.1086,
    state: "Nagaland", district: "Kohima",
    length_km: 54.0, surface_type: "Mountain Highway", road_class: "National Highway",
    current_status: "CLOSED", status_reason: "Severe landslide debris blocking both lanes at Mile 14; clearance underway",
    current_risk_score: 0.92, current_risk_level: "SEVERE",
    elevation_m: 1440.0, slope_degrees: 32.0, soil_type: "Unconsolidated Shale", distance_to_river_km: 0.4,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-SHN-ALT",
    highway_number: "SH-08",
    name: "Niuland to Kohima North Alternative Bypass",
    start_lat: 25.8200, start_lng: 93.7800,
    end_lat: 25.6751, end_lng: 94.1086,
    state: "Nagaland", district: "Kohima",
    length_km: 76.5, surface_type: "2-Lane Asphalt", road_class: "State Highway",
    current_status: "OPEN", status_reason: "Designated emergency bypass corridor",
    current_risk_score: 0.38, current_risk_level: "MEDIUM",
    elevation_m: 1100.0, slope_degrees: 12.0, soil_type: "Clay Loam", distance_to_river_km: 2.1,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH37-01",
    highway_number: "NH-37",
    name: "Guwahati Jalukbari to Nagaon Bypass",
    start_lat: 26.1445, start_lng: 91.7362,
    end_lat: 26.3452, end_lng: 92.6840,
    state: "Assam", district: "Kamrup Metropolitan",
    length_km: 118.0, surface_type: "4-Lane Paved", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Unimpeded transit",
    current_risk_score: 0.08, current_risk_level: "LOW",
    elevation_m: 55.0, slope_degrees: 1.5, soil_type: "Alluvial Plain", distance_to_river_km: 4.5,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH37-02",
    highway_number: "NH-37",
    name: "Nagaon to Kaziranga National Park Corridor",
    start_lat: 26.3452, start_lng: 92.6840,
    end_lat: 26.5800, end_lng: 93.3600,
    state: "Assam", district: "Nagaon",
    length_km: 88.0, surface_type: "2-Lane with Animal Corridors", road_class: "National Highway",
    current_status: "RESTRICTED", status_reason: "Speed limit 40 km/h due to flood warning and animal crossing",
    current_risk_score: 0.62, current_risk_level: "HIGH",
    elevation_m: 72.0, slope_degrees: 2.0, soil_type: "Wetland Silt", distance_to_river_km: 0.5,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH37-03",
    highway_number: "NH-37",
    name: "Jorhat to Dibrugarh Logistics Terminal",
    start_lat: 26.7509, start_lng: 94.2037,
    end_lat: 27.4728, end_lng: 94.9120,
    state: "Assam", district: "Dibrugarh",
    length_km: 132.0, surface_type: "4-Lane Highway", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Clear commercial passage",
    current_risk_score: 0.14, current_risk_level: "LOW",
    elevation_m: 98.0, slope_degrees: 1.8, soil_type: "Alluvial", distance_to_river_km: 2.0,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH13-01",
    highway_number: "NH-13",
    name: "Bhalukpong Assam-Arunachal Border to Bomdila",
    start_lat: 27.0100, start_lng: 92.6500,
    end_lat: 27.2600, end_lng: 92.4200,
    state: "Arunachal Pradesh", district: "Papum Pare",
    length_km: 96.0, surface_type: "Heavy Mountain Paved", road_class: "National Highway",
    current_status: "RESTRICTED", status_reason: "Heavy monsoon fog; convoys escorted by BRO",
    current_risk_score: 0.65, current_risk_level: "HIGH",
    elevation_m: 2210.0, slope_degrees: 26.0, soil_type: "Metamorphic Schist", distance_to_river_km: 0.6,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH13-02",
    highway_number: "NH-13",
    name: "Sela Tunnel Approach to Tawang Strategic Sector",
    start_lat: 27.5000, start_lng: 92.1000,
    end_lat: 27.5861, end_lng: 91.8594,
    state: "Arunachal Pradesh", district: "Tawang",
    length_km: 72.0, surface_type: "High Altitude All-Weather Paved", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Sela Tunnel operational; road clear",
    current_risk_score: 0.28, current_risk_level: "MEDIUM",
    elevation_m: 3100.0, slope_degrees: 20.0, soil_type: "Granite Alpine", distance_to_river_km: 1.5,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH102-01",
    highway_number: "NH-102",
    name: "Imphal East to Tengnoupal & Moreh Border",
    start_lat: 24.8170, start_lng: 93.9368,
    end_lat: 24.2400, end_lng: 94.3000,
    state: "Manipur", district: "Imphal West",
    length_km: 107.0, surface_type: "Paved Highway", road_class: "National Highway",
    current_status: "RESTRICTED", status_reason: "Security checkpoints and intermittent waterlogging",
    current_risk_score: 0.55, current_risk_level: "MEDIUM",
    elevation_m: 850.0, slope_degrees: 9.0, soil_type: "Clayey Silt", distance_to_river_km: 1.0,
    last_status_update: new Date().toISOString()
  },
  {
    id: "NER-RD-NH208-01",
    highway_number: "NH-208",
    name: "Kumarghat to Agartala Capital Gateway",
    start_lat: 24.1600, start_lng: 92.0200,
    end_lat: 23.8315, end_lng: 91.2868,
    state: "Tripura", district: "West Tripura",
    length_km: 124.0, surface_type: "2-Lane Asphalt", road_class: "National Highway",
    current_status: "OPEN", status_reason: "Normal vehicular movement",
    current_risk_score: 0.16, current_risk_level: "LOW",
    elevation_m: 60.0, slope_degrees: 3.0, soil_type: "Laterite Alluvium", distance_to_river_km: 1.8,
    last_status_update: new Date().toISOString()
  }
];

export const INITIAL_BRIDGES: Bridge[] = [
  {
    id: "NER-BRG-01",
    name: "Bhupen Hazarika Setu (Dhola-Sadiya Bridge)",
    road_segment_id: "NER-RD-NH37-03",
    lat: 27.7975, lng: 95.6631,
    state: "Assam", district: "Dibrugarh",
    river_name: "Lohit River",
    health_status: "SAFE",
    load_capacity_tons: 60.0, length_meters: 9150.0,
    last_inspected: new Date().toISOString()
  },
  {
    id: "NER-BRG-02",
    name: "Bogibeel Rail-cum-Road Bridge",
    road_segment_id: "NER-RD-NH37-03",
    lat: 27.3994, lng: 94.7578,
    state: "Assam", district: "Dibrugarh",
    river_name: "Brahmaputra River",
    health_status: "SAFE",
    load_capacity_tons: 70.0, length_meters: 4940.0,
    last_inspected: new Date().toISOString()
  },
  {
    id: "NER-BRG-03",
    name: "Old Saraighat Bridge",
    road_segment_id: "NER-RD-NH37-01",
    lat: 26.1783, lng: 91.6853,
    state: "Assam", district: "Kamrup Metropolitan",
    river_name: "Brahmaputra River",
    health_status: "CAUTION",
    load_capacity_tons: 35.0, length_meters: 1290.0,
    last_inspected: new Date().toISOString()
  },
  {
    id: "NER-BRG-04",
    name: "Coronation Bridge (Sevoke)",
    road_segment_id: "NER-RD-NH10-01",
    lat: 26.8833, lng: 88.4667,
    state: "Sikkim", district: "Gangtok",
    river_name: "Teesta River",
    health_status: "CAUTION",
    load_capacity_tons: 25.0, length_meters: 110.0,
    last_inspected: new Date().toISOString()
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: "INC-2026-001",
    title: "Severe Rockfall & Mudslide on Chumukedima Hill Section",
    category: "LANDSLIDE",
    severity: "CRITICAL",
    status: "VERIFIED",
    road_segment_id: "NER-RD-NH29-02",
    lat: 25.7500, lng: 93.9200,
    state: "Nagaland", district: "Kohima",
    description: "Massive landslide brought down boulders and wet mud over a 150-meter stretch of NH-29. Both carriageways blocked. Heavy BRO excavators deployed.",
    reporter_name: "Field Officer Vilie Angami",
    verifier_name: "Sri Debajit Saikia (DDMA Officer)",
    verification_notes: "Ground verification confirmed complete blockage. Traffic diverted to Niuland-Kohima State Route.",
    image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "INC-2026-002",
    title: "Teesta River Swelling & Bank Erosion near 29th Mile",
    category: "FLOOD",
    severity: "HIGH",
    status: "VERIFIED",
    road_segment_id: "NER-RD-NH10-01",
    lat: 26.9800, lng: 88.4800,
    state: "Sikkim", district: "Gangtok",
    description: "Continuous heavy rainfall in upper catchment has caused Teesta waters to lap against the road revetment. Road restricted to light motor vehicles only.",
    reporter_name: "Tenzing Lepcha (Field Officer)",
    verifier_name: "District Magistrate Gangtok",
    verification_notes: "Heavy trucks over 15 tons diverted via Lava-Algarah corridor.",
    image_url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "INC-2026-003",
    title: "Kaziranga Southern Edge Flood Water Logging",
    category: "FLOOD",
    severity: "MEDIUM",
    status: "UNDER_REVIEW",
    road_segment_id: "NER-RD-NH37-02",
    lat: 26.5900, lng: 93.2000,
    state: "Assam", district: "Nagaon",
    description: "Mora Diphlu stream overflowing onto low-lying shoulder. Wildlife moving towards Karbi Anglong hills across highway.",
    reporter_name: "Forest Ranger Bipul Das",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "AS-01-GB-4521",
    model_name: "Tata Prima 3530.K Heavy Carrier",
    driver_name: "Ramen Kakati",
    driver_phone: "+91-9854123890",
    status: "IN_TRANSIT",
    current_lat: 25.8500, current_lng: 93.7500,
    current_speed_kmh: 42.5, current_heading: 115.0,
    fuel_pct: 78.0, is_anomaly: false,
    last_telemetry_time: new Date().toISOString()
  },
  {
    id: "SK-01-EA-1092",
    model_name: "Ashok Leyland Captain 2820",
    driver_name: "Pemba Bhutia",
    driver_phone: "+91-9800778899",
    status: "IN_TRANSIT",
    current_lat: 27.1200, current_lng: 88.5100,
    current_speed_kmh: 28.0, current_heading: 45.0,
    fuel_pct: 64.0, is_anomaly: false,
    last_telemetry_time: new Date().toISOString()
  },
  {
    id: "NL-07-C-7744",
    model_name: "Eicher Pro 6035",
    driver_name: "Kevi Sema",
    driver_phone: "+91-9436123456",
    status: "STALLED",
    current_lat: 25.8150, current_lng: 93.7900,
    current_speed_kmh: 0.0, current_heading: 90.0,
    fuel_pct: 82.0, is_anomaly: true,
    anomaly_reason: "Stalled for > 75 minutes at Chumukedima landslide approach",
    last_telemetry_time: new Date().toISOString()
  },
  {
    id: "ML-05-D-3301",
    model_name: "BharatBenz 2823R",
    driver_name: "Khyrmen Mawlong",
    driver_phone: "+91-9774012399",
    status: "IDLE",
    current_lat: 25.5788, current_lng: 91.8933,
    current_speed_kmh: 0.0, current_heading: 0.0,
    fuel_pct: 92.0, is_anomaly: false,
    last_telemetry_time: new Date().toISOString()
  }
];

export const INITIAL_CONSIGNMENTS: Consignment[] = [
  {
    id: "CNS-NER-2026-081",
    title: "Cold-Chain Critical Vaccines & Antibiotics",
    cargo_type: "MEDICINE",
    priority: "CRITICAL",
    status: "IN_TRANSIT",
    weight_tons: 2.4,
    origin_name: "Guwahati Central Medical Depot (Jalukbari)",
    origin_lat: 26.1445, origin_lng: 91.7362,
    destination_name: "Kohima Civil Hospital & Medical Store",
    destination_lat: 25.6751, destination_lng: 94.1086,
    assigned_vehicle_id: "AS-01-GB-4521",
    planned_distance_km: 348.0,
    estimated_duration_hours: 8.5,
    expected_delivery_time: new Date(Date.now() + 4 * 3600000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "CNS-NER-2026-082",
    title: "FCI Essential Rice & Grain Emergency Ration",
    cargo_type: "FOOD",
    priority: "HIGH",
    status: "IN_TRANSIT",
    weight_tons: 18.0,
    origin_name: "Siliguri Food Corporation Depot",
    origin_lat: 26.7271, origin_lng: 88.3953,
    destination_name: "Gangtok Food Distribution Warehouse",
    destination_lat: 27.3389, destination_lng: 88.6065,
    assigned_vehicle_id: "SK-01-EA-1092",
    planned_distance_km: 114.0,
    estimated_duration_hours: 4.5,
    expected_delivery_time: new Date(Date.now() + 2 * 3600000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "CNS-NER-2026-083",
    title: "Structural Bridge Girder Components",
    cargo_type: "CONSTRUCTION",
    priority: "MEDIUM",
    status: "DELAYED",
    weight_tons: 24.5,
    origin_name: "Dimapur Railway Freight Yard",
    origin_lat: 25.9068, origin_lng: 93.7273,
    destination_name: "Imphal Highway Expansion Project Base",
    destination_lat: 24.8170, destination_lng: 93.9368,
    assigned_vehicle_id: "NL-07-C-7744",
    planned_distance_km: 204.0,
    estimated_duration_hours: 6.5,
    expected_delivery_time: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date().toISOString()
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "ALT-2026-001",
    title: "NH-29 Complete Road Closure: Landslide at Mile 14",
    message: "NH-29 between Chumukedima and Kohima is strictly CLOSED for all vehicular traffic due to massive rockfall. Divert to Niuland-Kohima bypass.",
    severity: "CRITICAL",
    category: "ROAD_CLOSURE",
    state: "Nagaland", district: "Kohima",
    road_segment_id: "NER-RD-NH29-02",
    recommended_action: "Avoid NH-29 corridor. Take Niuland State Route SH-08.",
    source: "Nagaland State Disaster Management Authority (NSDMA)",
    is_active: true, is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: "ALT-2026-002",
    title: "High Landslide Risk Warning: NH-10 Teesta Corridor",
    message: "Heavy 24h rainfall (140mm) predicted over Darjeeling-Sikkim foothills. Soil saturation at 82%. Travel after sunset discouraged.",
    severity: "WARNING",
    category: "HIGH_RISK",
    state: "Sikkim", district: "Gangtok",
    road_segment_id: "NER-RD-NH10-01",
    recommended_action: "Heavy multi-axle freight vehicles to halt at Melli checkpost.",
    source: "IMD Gangtok Regional Meteorological Centre",
    is_active: true, is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: "ALT-2026-003",
    title: "Vehicle Stoppage Alert: Consignment CNS-NER-2026-083",
    message: "Vehicle NL-07-C-7744 carrying construction materials has been stationary for 75+ mins near Chumukedima approach.",
    severity: "DANGER",
    category: "VEHICLE_DELAY",
    state: "Nagaland", district: "Dimapur",
    road_segment_id: "NER-RD-NH29-02",
    recommended_action: "Contact driver Kevi Sema (+91-9436123456) and reroute via SH-08.",
    source: "AI Fleet Telemetry Anomaly Detector",
    is_active: true, is_verified: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_PREDICTIONS: DisruptionPrediction[] = [
  {
    id: 1,
    road_segment_id: "NER-RD-NH29-02",
    risk_probability: 0.92,
    risk_level: "SEVERE",
    forecast_horizon_hours: 24,
    contributing_factors: {
      "rainfall_24h_mm": 0.36,
      "slope_steepness": 0.28,
      "shale_rock_instability": 0.16,
      "antecedent_saturation": 0.12
    },
    rainfall_current_mm: 142.0,
    rainfall_antecedent_mm: 280.0,
    soil_saturation_pct: 91.5,
    weather_summary: "Extremely Heavy Monsoonal Downpour",
    model_version: "xgb-v1.0.0-ner",
    model_type: "XGBoost Classifier",
    prediction_confidence: 0.94,
    uncertainty_score: 0.06,
    data_provenance: "IMD Weather + Bhuvan Terrain + Historic Incidents",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    road_segment_id: "NER-RD-NH10-01",
    risk_probability: 0.78,
    risk_level: "HIGH",
    forecast_horizon_hours: 24,
    contributing_factors: {
      "river_distance_proximity": 0.34,
      "rainfall_intensity": 0.26,
      "slope_erosion": 0.18
    },
    rainfall_current_mm: 98.0,
    rainfall_antecedent_mm: 190.0,
    soil_saturation_pct: 82.0,
    weather_summary: "Heavy Continuous Downpour",
    model_version: "xgb-v1.0.0-ner",
    model_type: "XGBoost Classifier",
    prediction_confidence: 0.89,
    uncertainty_score: 0.11,
    data_provenance: "IMD Weather + Bhuvan Terrain",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    road_segment_id: "NER-RD-NH13-01",
    risk_probability: 0.65,
    risk_level: "HIGH",
    forecast_horizon_hours: 24,
    contributing_factors: {
      "high_altitude_slope": 0.31,
      "monsoon_saturation": 0.24,
      "fog_visibility": 0.10
    },
    rainfall_current_mm: 75.0,
    rainfall_antecedent_mm: 140.0,
    soil_saturation_pct: 74.0,
    weather_summary: "Dense Mountain Fog & Heavy Showers",
    model_version: "xgb-v1.0.0-ner",
    model_type: "XGBoost Classifier",
    prediction_confidence: 0.86,
    uncertainty_score: 0.14,
    data_provenance: "IMD Weather + Bhuvan Terrain",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    road_segment_id: "NER-RD-NH40-01",
    risk_probability: 0.12,
    risk_level: "LOW",
    forecast_horizon_hours: 24,
    contributing_factors: {
      "engineered_drainage": -0.25,
      "slope_protection_wall": -0.20,
      "moderate_showers": 0.08
    },
    rainfall_current_mm: 24.0,
    rainfall_antecedent_mm: 60.0,
    soil_saturation_pct: 45.0,
    weather_summary: "Light Showers",
    model_version: "xgb-v1.0.0-ner",
    model_type: "XGBoost Classifier",
    prediction_confidence: 0.95,
    uncertainty_score: 0.05,
    data_provenance: "IMD Weather + PWD Inventory",
    created_at: new Date().toISOString()
  }
];
