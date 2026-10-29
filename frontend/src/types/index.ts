export type UserRole = 
  | 'SUPER_ADMIN'
  | 'GOVT_ADMIN'
  | 'DISTRICT_OFFICER'
  | 'FIELD_OFFICER'
  | 'LOGISTICS_OPERATOR'
  | 'PUBLIC_VIEWER';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  department?: string;
  state?: string;
  district?: string;
}

export type RoadStatus = 'OPEN' | 'RESTRICTED' | 'CLOSED' | 'UNKNOWN';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';

export interface RoadSegment {
  id: string;
  highway_number: string;
  name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  state: string;
  district: string;
  length_km: number;
  surface_type: string;
  road_class: string;
  current_status: RoadStatus;
  status_reason?: string;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  elevation_m: number;
  slope_degrees: number;
  soil_type: string;
  distance_to_river_km: number;
  last_status_update: string;
}

export interface Bridge {
  id: string;
  name: string;
  road_segment_id?: string;
  lat: number;
  lng: number;
  state: string;
  district: string;
  river_name: string;
  health_status: 'SAFE' | 'CAUTION' | 'CRITICAL';
  load_capacity_tons: number;
  length_meters: number;
  last_inspected: string;
}

export type IncidentCategory = 
  | 'LANDSLIDE'
  | 'FLOOD'
  | 'ROAD_DAMAGE'
  | 'BRIDGE_DAMAGE'
  | 'CONGESTION'
  | 'SEVERE_WEATHER'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOLVED' | 'REJECTED';

export interface IncidentReport {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  road_segment_id?: string;
  lat: number;
  lng: number;
  state: string;
  district: string;
  description: string;
  reported_by_id?: number;
  reporter_name: string;
  reporter_phone?: string;
  verified_by_id?: number;
  verifier_name?: string;
  verification_notes?: string;
  image_url?: string;
  offline_client_id?: string;
  created_at: string;
  verified_at?: string;
  resolved_at?: string;
}

export interface DisruptionPrediction {
  id: number;
  road_segment_id: string;
  risk_probability: number;
  risk_level: RiskLevel;
  forecast_horizon_hours: number;
  contributing_factors: Record<string, number>;
  rainfall_current_mm: number;
  rainfall_antecedent_mm: number;
  soil_saturation_pct: number;
  weather_summary: string;
  model_version: string;
  model_type: string;
  prediction_confidence: number;
  uncertainty_score: number;
  data_provenance: string;
  created_at: string;
}

export type VehicleStatus = 'IDLE' | 'IN_TRANSIT' | 'STALLED' | 'MAINTENANCE';
export type CargoType = 'MEDICINE' | 'FOOD' | 'AGRI' | 'CONSTRUCTION' | 'EMERGENCY';
export type ConsignmentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ConsignmentStatus = 'REGISTERED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'CANCELLED';

export interface Vehicle {
  id: string;
  model_name: string;
  driver_name: string;
  driver_phone: string;
  status: VehicleStatus;
  current_lat: number;
  current_lng: number;
  current_speed_kmh: number;
  current_heading: number;
  fuel_pct: number;
  is_anomaly: boolean;
  anomaly_reason?: string;
  last_telemetry_time: string;
}

export interface TelemetryPoint {
  id: number;
  vehicle_id: string;
  lat: number;
  lng: number;
  speed_kmh: number;
  heading: number;
  is_anomaly: boolean;
  timestamp: string;
}

export interface Consignment {
  id: string;
  title: string;
  cargo_type: CargoType;
  priority: ConsignmentPriority;
  status: ConsignmentStatus;
  weight_tons: number;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  assigned_vehicle_id?: string;
  planned_distance_km: number;
  estimated_duration_hours: number;
  expected_delivery_time?: string;
  actual_delivery_time?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  category: string;
  state: string;
  district?: string;
  road_segment_id?: string;
  is_active: boolean;
  is_verified: boolean;
  recommended_action?: string;
  source: string;
  created_at: string;
}

export interface RouteSegmentDetail {
  road_segment_id: string;
  name: string;
  highway_number: string;
  length_km: number;
  risk_score: number;
  status: RoadStatus;
}

export interface RouteAlternative {
  route_id: string;
  label: string;
  is_recommended: boolean;
  path_coords: [number, number][];
  total_distance_km: number;
  estimated_time_hours: number;
  average_risk_score: number;
  max_segment_risk: number;
  passes_closed_roads: boolean;
  segments: RouteSegmentDetail[];
  safety_notes: string[];
  cost_score: number;
}

export interface RoutePlanResponse {
  origin: string;
  destination: string;
  cargo_type: CargoType;
  primary_route?: RouteAlternative;
  safer_route?: RouteAlternative;
  alternatives: RouteAlternative[];
  warning_message?: string;
  data_freshness_timestamp: string;
}
