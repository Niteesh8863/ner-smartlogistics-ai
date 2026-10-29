import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from app.core.database import Base

class RoadStatus(str, enum.Enum):
    OPEN = "OPEN"
    RESTRICTED = "RESTRICTED"
    CLOSED = "CLOSED"
    UNKNOWN = "UNKNOWN"

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SEVERE = "SEVERE"

class BridgeHealth(str, enum.Enum):
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    CRITICAL = "CRITICAL"

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    capital = Column(String(100), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state_name = Column(String(100), nullable=False, index=True)
    headquarters = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

class RoadSegment(Base):
    __tablename__ = "road_segments"

    id = Column(String(50), primary_key=True, index=True)
    highway_number = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    length_km = Column(Float, nullable=False)
    surface_type = Column(String(50), default="Paved")
    road_class = Column(String(50), default="National Highway")
    
    current_status = Column(Enum(RoadStatus), default=RoadStatus.OPEN, nullable=False)
    status_reason = Column(String(255), default="Normal traffic flow")
    current_risk_score = Column(Float, default=0.10) # 0.0 - 1.0
    current_risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    
    # Terrain & Geo features for ML & Routing
    elevation_m = Column(Float, default=150.0)
    slope_degrees = Column(Float, default=5.0)
    soil_type = Column(String(50), default="Alluvial")
    distance_to_river_km = Column(Float, default=2.5)
    
    last_status_update = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Bridge(Base):
    __tablename__ = "bridges"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    road_segment_id = Column(String(50), ForeignKey("road_segments.id"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    river_name = Column(String(100), nullable=False)
    health_status = Column(Enum(BridgeHealth), default=BridgeHealth.SAFE)
    load_capacity_tons = Column(Float, default=40.0)
    length_meters = Column(Float, default=250.0)
    last_inspected = Column(DateTime, default=lambda: datetime.now(timezone.utc))

