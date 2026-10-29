from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False, index=True) # e.g. "VERIFY_INCIDENT", "UPDATE_ROAD_STATUS", "DISPATCH_CONSIGNMENT"
    resource_type = Column(String(100), nullable=False)      # e.g. "IncidentReport", "RoadSegment", "Consignment"
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

