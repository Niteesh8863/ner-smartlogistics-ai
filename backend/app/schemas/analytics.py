from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.alert import AlertOut
from app.schemas.incident import IncidentOut

class DistrictAccessibilityMetric(BaseModel):
    district: str
    state: str
    total_segments: int
    open_pct: float
    high_risk_count: int
    active_incidents: int
    accessibility_index: float # 0 to 100

class HistoricalTrendPoint(BaseModel):
    month_name: str
    landslide_events: int
    flood_events: int
    avg_rainfall_mm: int
    average_delay_hours: float

class HotspotRanking(BaseModel):
    corridor_name: str
    highway: str
    state: str
    historical_disruptions: int
    current_risk_score: float
    status: str

class DashboardSummaryOut(BaseModel):
    total_monitored_segments: int
    open_segments: int
    restricted_segments: int
    closed_segments: int
    high_risk_corridors_count: int
    active_incidents_count: int
    pending_verifications_count: int
    tracked_vehicles_count: int
    active_consignments_count: int
    delayed_consignments_count: int
    safe_accessibility_pct: float
    last_updated: datetime
    recent_alerts: List[AlertOut]
    district_rankings: List[DistrictAccessibilityMetric]
    disruption_trends: List[HistoricalTrendPoint]
    recurring_hotspots: List[HotspotRanking]

