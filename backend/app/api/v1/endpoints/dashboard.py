from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.spatial import RoadSegment, RoadStatus, RiskLevel, District, State
from app.models.incident import IncidentReport, IncidentStatus
from app.models.logistics import Vehicle, Consignment, ConsignmentStatus, VehicleStatus
from app.models.alert import Alert
from app.schemas.analytics import DashboardSummaryOut, DistrictAccessibilityMetric, HistoricalTrendPoint, HotspotRanking
from app.schemas.alert import AlertOut

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    state: Optional[str] = Query(None, description="Filter by NER state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db)
):
    # Query segments with optional state/district filtering
    seg_query = db.query(RoadSegment)
    if state and state != "ALL":
        seg_query = seg_query.filter(RoadSegment.state == state)
    if district and district != "ALL":
        seg_query = seg_query.filter(RoadSegment.district == district)

    segments = seg_query.all()
    total_segments = len(segments)
    open_segments = sum(1 for s in segments if s.current_status == RoadStatus.OPEN)
    restricted_segments = sum(1 for s in segments if s.current_status == RoadStatus.RESTRICTED)
    closed_segments = sum(1 for s in segments if s.current_status == RoadStatus.CLOSED)
    high_risk_count = sum(1 for s in segments if s.current_risk_level in [RiskLevel.HIGH, RiskLevel.SEVERE])

    # Incidents
    inc_query = db.query(IncidentReport)
    if state and state != "ALL":
        inc_query = inc_query.filter(IncidentReport.state == state)
    if district and district != "ALL":
        inc_query = inc_query.filter(IncidentReport.district == district)

    incidents = inc_query.all()
    active_incidents = sum(1 for i in incidents if i.status in [IncidentStatus.REPORTED, IncidentStatus.UNDER_REVIEW, IncidentStatus.VERIFIED])
    pending_verifications = sum(1 for i in incidents if i.status in [IncidentStatus.REPORTED, IncidentStatus.UNDER_REVIEW])

    # Vehicles and Consignments
    tracked_vehicles = db.query(Vehicle).count()
    active_consignments = db.query(Consignment).filter(
        Consignment.status.in_([ConsignmentStatus.ASSIGNED, ConsignmentStatus.IN_TRANSIT, ConsignmentStatus.DELAYED])
    ).count()
    delayed_consignments = db.query(Consignment).filter(Consignment.status == ConsignmentStatus.DELAYED).count()

    safe_accessibility_pct = round((open_segments / max(total_segments, 1)) * 100, 1)

    # Recent verified alerts
    alert_query = db.query(Alert).filter(Alert.is_active == True)
    if state and state != "ALL":
        alert_query = alert_query.filter(Alert.state == state)
    recent_alerts = [AlertOut.from_orm(a) for a in alert_query.order_by(Alert.created_at.desc()).limit(5).all()]

    # District Rankings
    all_districts = db.query(District).all()
    district_rankings: List[DistrictAccessibilityMetric] = []
    for d in all_districts[:10]: # Top 10 key districts
        d_segs = [s for s in segments if s.district == d.name]
        d_total = len(d_segs)
        d_open = sum(1 for s in d_segs if s.current_status == RoadStatus.OPEN)
        d_high_risk = sum(1 for s in d_segs if s.current_risk_level in [RiskLevel.HIGH, RiskLevel.SEVERE])
        d_active_inc = sum(1 for i in incidents if i.district == d.name and i.status != IncidentStatus.RESOLVED)

        open_pct = (d_open / max(d_total, 1)) * 100.0 if d_total > 0 else 85.0
        acc_idx = max(0.0, open_pct - (d_high_risk * 15.0) - (d_active_inc * 10.0))

        district_rankings.append(DistrictAccessibilityMetric(
            district=d.name,
            state=d.state_name,
            total_segments=max(d_total, 1),
            open_pct=round(open_pct, 1),
            high_risk_count=d_high_risk,
            active_incidents=d_active_inc,
            accessibility_index=round(min(100.0, acc_idx), 1)
        ))
    district_rankings.sort(key=lambda x: x.accessibility_index)

    # Disruption Historical Trends
    disruption_trends = [
        HistoricalTrendPoint(month_name="May", landslide_events=8, flood_events=4, avg_rainfall_mm=190, average_delay_hours=2.4),
        HistoricalTrendPoint(month_name="Jun", landslide_events=22, flood_events=18, avg_rainfall_mm=480, average_delay_hours=5.8),
        HistoricalTrendPoint(month_name="Jul", landslide_events=34, flood_events=28, avg_rainfall_mm=620, average_delay_hours=8.2),
        HistoricalTrendPoint(month_name="Aug", landslide_events=29, flood_events=21, avg_rainfall_mm=540, average_delay_hours=6.5),
        HistoricalTrendPoint(month_name="Sep", landslide_events=16, flood_events=9, avg_rainfall_mm=310, average_delay_hours=3.9),
        HistoricalTrendPoint(month_name="Oct", landslide_events=6, flood_events=2, avg_rainfall_mm=110, average_delay_hours=1.6),
    ]

    # Recurring Hotspots
    recurring_hotspots = [
        HotspotRanking(corridor_name="Chumukedima Rockfall Hill Stretch", highway="NH-29", state="Nagaland", historical_disruptions=18, current_risk_score=0.92, status="CLOSED"),
        HotspotRanking(corridor_name="Sevoke Coronation to Teesta Bazaar", highway="NH-10", state="Sikkim", historical_disruptions=14, current_risk_score=0.78, status="RESTRICTED"),
        HotspotRanking(corridor_name="Bhalukpong to Bomdila Mountain Pass", highway="NH-13", state="Arunachal Pradesh", historical_disruptions=11, current_risk_score=0.65, status="RESTRICTED"),
        HotspotRanking(corridor_name="Kaziranga Diphlu Flood Inundation Section", highway="NH-37", state="Assam", historical_disruptions=9, current_risk_score=0.62, status="RESTRICTED"),
    ]

    return DashboardSummaryOut(
        total_monitored_segments=total_segments,
        open_segments=open_segments,
        restricted_segments=restricted_segments,
        closed_segments=closed_segments,
        high_risk_corridors_count=high_risk_count,
        active_incidents_count=active_incidents,
        pending_verifications_count=pending_verifications,
        tracked_vehicles_count=tracked_vehicles,
        active_consignments_count=active_consignments,
        delayed_consignments_count=delayed_consignments,
        safe_accessibility_pct=safe_accessibility_pct,
        last_updated=datetime.now(timezone.utc),
        recent_alerts=recent_alerts,
        district_rankings=district_rankings,
        disruption_trends=disruption_trends,
        recurring_hotspots=recurring_hotspots
    )

