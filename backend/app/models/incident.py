import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from app.core.database import Base

class IncidentCategory(str, enum.Enum):
    LANDSLIDE = "LANDSLIDE"
    FLOOD = "FLOOD"
    ROAD_DAMAGE = "ROAD_DAMAGE"
    BRIDGE_DAMAGE = "BRIDGE_DAMAGE"
    CONGESTION = "CONGESTION"
    SEVERE_WEATHER = "SEVERE_WEATHER"
    OTHER = "OTHER"

class IncidentSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(Enum(IncidentCategory), nullable=False)
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.REPORTED, nullable=False, index=True)
    
    road_segment_id = Column(String(50), ForeignKey("road_segments.id"), nullable=True, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String(150), nullable=False)
    reporter_phone = Column(String(30), nullable=True)
    
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verifier_name = Column(String(150), nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    image_url = Column(Text, nullable=True)
    offline_client_id = Column(String(100), unique=True, nullable=True, index=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    verified_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

