from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertSeverity, AlertCategory

class AlertCreate(BaseModel):
    title: str
    message: str
    severity: AlertSeverity = AlertSeverity.WARNING
    category: AlertCategory = AlertCategory.ROAD_CLOSURE
    state: str
    district: Optional[str] = None
    road_segment_id: Optional[str] = None
    recommended_action: Optional[str] = None
    source: Optional[str] = "State Emergency Operations Centre (SEOC)"
    expires_at: Optional[datetime] = None

class AlertOut(BaseModel):
    id: str
    title: str
    message: str
    severity: AlertSeverity
    category: AlertCategory
    state: str
    district: Optional[str]
    road_segment_id: Optional[str]
    is_active: bool
    is_verified: bool
    recommended_action: Optional[str]
    source: str
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True

