from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.logistics import VehicleStatus, CargoType, ConsignmentPriority, ConsignmentStatus

class VehicleCreate(BaseModel):
    id: str
    model_name: Optional[str] = "Tata Prima Heavy Carrier"
    driver_name: str
    driver_phone: str
    current_lat: float
    current_lng: float

class VehicleLocationUpdate(BaseModel):
    lat: float
    lng: float
    speed_kmh: float
    heading: float = 0.0

class VehicleOut(BaseModel):
    id: str
    model_name: str
    driver_name: str
    driver_phone: str
    status: VehicleStatus
    current_lat: float
    current_lng: float
    current_speed_kmh: float
    current_heading: float
    fuel_pct: float
    is_anomaly: bool
    anomaly_reason: Optional[str]
    last_telemetry_time: datetime

    class Config:
        from_attributes = True

class ConsignmentCreate(BaseModel):
    id: str
    title: str
    cargo_type: CargoType
    priority: ConsignmentPriority = ConsignmentPriority.HIGH
    weight_tons: float = 5.0
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    assigned_vehicle_id: Optional[str] = None
    expected_delivery_time: Optional[datetime] = None

class ConsignmentStatusUpdate(BaseModel):
    status: ConsignmentStatus
    assigned_vehicle_id: Optional[str] = None

class ConsignmentOut(BaseModel):
    id: str
    title: str
    cargo_type: CargoType
    priority: ConsignmentPriority
    status: ConsignmentStatus
    weight_tons: float
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    assigned_vehicle_id: Optional[str]
    planned_distance_km: float
    estimated_duration_hours: float
    expected_delivery_time: Optional[datetime]
    actual_delivery_time: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class TelemetryPointOut(BaseModel):
    id: int
    vehicle_id: str
    lat: float
    lng: float
    speed_kmh: float
    heading: float
    is_anomaly: bool
    timestamp: datetime

    class Config:
        from_attributes = True

