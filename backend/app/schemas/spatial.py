from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.models.spatial import RoadStatus, RiskLevel, BridgeHealth
from app.models.logistics import CargoType

class StateOut(BaseModel):
    id: int
    name: str
    code: str
    capital: str
    center_lat: float
    center_lng: float

    class Config:
        from_attributes = True

class DistrictOut(BaseModel):
    id: int
    name: str
    state_name: str
    headquarters: str
    lat: float
    lng: float

    class Config:
        from_attributes = True

class RoadSegmentOut(BaseModel):
    id: str
    highway_number: str
    name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    state: str
    district: str
    length_km: float
    surface_type: str
    road_class: str
    current_status: RoadStatus
    status_reason: Optional[str]
    current_risk_score: float
    current_risk_level: RiskLevel
    elevation_m: float
    slope_degrees: float
    soil_type: str
    distance_to_river_km: float
    last_status_update: datetime

    class Config:
        from_attributes = True

class RoadSegmentStatusUpdate(BaseModel):
    status: RoadStatus
    reason: str

class BridgeOut(BaseModel):
    id: str
    name: str
    road_segment_id: Optional[str]
    lat: float
    lng: float
    state: str
    district: str
    river_name: str
    health_status: BridgeHealth
    load_capacity_tons: float
    length_meters: float
    last_inspected: datetime

    class Config:
        from_attributes = True

class RoutePlanRequest(BaseModel):
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    cargo_type: CargoType = CargoType.MEDICINE
    avoid_high_risk: bool = True
    alpha_time: float = 0.40       # Weight for travel time
    beta_risk: float = 0.45        # Weight for disruption risk
    gamma_dist: float = 0.15       # Weight for distance

class RouteSegmentDetail(BaseModel):
    road_segment_id: str
    name: str
    highway_number: str
    length_km: float
    risk_score: float
    status: RoadStatus

class RouteAlternative(BaseModel):
    route_id: str
    label: str                     # e.g. "Fastest Standard Route" or "Safer Recommended Corridor"
    is_recommended: bool
    path_coords: List[List[float]] # [[lat, lng], [lat, lng], ...]
    total_distance_km: float
    estimated_time_hours: float
    average_risk_score: float
    max_segment_risk: float
    passes_closed_roads: bool
    segments: List[RouteSegmentDetail]
    safety_notes: List[str]
    cost_score: float

class RoutePlanResponse(BaseModel):
    origin: str
    destination: str
    cargo_type: CargoType
    primary_route: Optional[RouteAlternative]
    safer_route: Optional[RouteAlternative]
    alternatives: List[RouteAlternative]
    warning_message: Optional[str] = None
    data_freshness_timestamp: datetime

