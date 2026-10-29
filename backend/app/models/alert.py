import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Boolean
from app.core.database import Base

class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    DANGER = "DANGER"
    CRITICAL = "CRITICAL"

class AlertCategory(str, enum.Enum):
    ROAD_CLOSURE = "ROAD_CLOSURE"
    HIGH_RISK = "HIGH_RISK"
    SEVERE_WEATHER = "SEVERE_WEATHER"
    VEHICLE_DELAY = "VEHICLE_DELAY"
    ROUTE_DEVIATION = "ROUTE_DEVIATION"
    BRIDGE_ALERT = "BRIDGE_ALERT"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True) # e.g. "ALT-2026-901"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.WARNING, nullable=False)
    category = Column(Enum(AlertCategory), default=AlertCategory.ROAD_CLOSURE, nullable=False)
    
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True, index=True)
    road_segment_id = Column(String(50), ForeignKey("road_segments.id"), nullable=True)
    
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=True)
    recommended_action = Column(String(255), nullable=True)
    source = Column(String(100), default="State Emergency Operations Centre (SEOC)")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    expires_at = Column(DateTime, nullable=True)

