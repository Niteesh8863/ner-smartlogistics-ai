from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.incident import IncidentCategory, IncidentSeverity, IncidentStatus
from app.models.spatial import RoadStatus

class IncidentCreate(BaseModel):
    title: str
    category: IncidentCategory
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    road_segment_id: Optional[str] = None
    lat: float
    lng: float
    state: str
    district: str
    description: str
    reporter_name: Optional[str] = "Field Officer"
    reporter_phone: Optional[str] = None
    image_url: Optional[str] = None
    offline_client_id: Optional[str] = None

class IncidentVerifyRequest(BaseModel):
    status: IncidentStatus # VERIFIED or REJECTED
    verification_notes: str
    update_road_segment: bool = False
    new_road_status: Optional[RoadStatus] = None

class IncidentResolveRequest(BaseModel):
    resolution_notes: str
    restore_road_open: bool = True

class IncidentOut(BaseModel):
    id: str
    title: str
    category: IncidentCategory
    severity: IncidentSeverity
    status: IncidentStatus
    road_segment_id: Optional[str]
    lat: float
    lng: float
    state: str
    district: str
    description: str
    reported_by_id: Optional[int]
    reporter_name: str
    reporter_phone: Optional[str]
    verified_by_id: Optional[int]
    verifier_name: Optional[str]
    verification_notes: Optional[str]
    image_url: Optional[str]
    offline_client_id: Optional[str]
    created_at: datetime
    verified_at: Optional[datetime]
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

