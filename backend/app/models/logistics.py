import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from app.core.database import Base

class VehicleStatus(str, enum.Enum):
    IDLE = "IDLE"
    IN_TRANSIT = "IN_TRANSIT"
    STALLED = "STALLED"
    MAINTENANCE = "MAINTENANCE"

class CargoType(str, enum.Enum):
    MEDICINE = "MEDICINE"
    FOOD = "FOOD"
    AGRI = "AGRI"
    CONSTRUCTION = "CONSTRUCTION"
    EMERGENCY = "EMERGENCY"

class ConsignmentPriority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ConsignmentStatus(str, enum.Enum):
    REGISTERED = "REGISTERED"
    ASSIGNED = "ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    DELAYED = "DELAYED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(50), primary_key=True, index=True) # e.g. "AS-01-GB-4521"
    model_name = Column(String(100), default="Tata Prima Heavy Carrier")
    driver_name = Column(String(150), nullable=False)
    driver_phone = Column(String(30), nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.IDLE, nullable=False)
    
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    current_speed_kmh = Column(Float, default=0.0)
    current_heading = Column(Float, default=0.0)
    
    fuel_pct = Column(Float, default=85.0)
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String(255), nullable=True)
    
    last_telemetry_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Consignment(Base):
    __tablename__ = "consignments"

    id = Column(String(50), primary_key=True, index=True) # e.g. "CNS-NER-2026-081"
    title = Column(String(255), nullable=False)
    cargo_type = Column(Enum(CargoType), nullable=False)
    priority = Column(Enum(ConsignmentPriority), default=ConsignmentPriority.HIGH, nullable=False)
    status = Column(Enum(ConsignmentStatus), default=ConsignmentStatus.REGISTERED, nullable=False)
    
    weight_tons = Column(Float, default=5.0)
    origin_name = Column(String(150), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    
    destination_name = Column(String(150), nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    
    assigned_vehicle_id = Column(String(50), ForeignKey("vehicles.id"), nullable=True)
    
    # Route details
    planned_distance_km = Column(Float, default=0.0)
    estimated_duration_hours = Column(Float, default=0.0)
    planned_route_coords_json = Column(Text, nullable=True) # GeoJSON or [[lat, lng], ...]
    
    expected_delivery_time = Column(DateTime, nullable=True)
    actual_delivery_time = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TelemetryPoint(Base):
    __tablename__ = "telemetry_points"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(50), ForeignKey("vehicles.id"), nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=0.0)
    heading = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

