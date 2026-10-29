from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incident import IncidentReport, IncidentStatus, IncidentCategory, IncidentSeverity
from app.models.spatial import RoadSegment, RoadStatus
from app.models.alert import Alert, AlertSeverity, AlertCategory
from app.models.user import User, UserRole
from app.schemas.incident import IncidentCreate, IncidentVerifyRequest, IncidentResolveRequest, IncidentOut
from app.api.deps import get_current_user, require_roles, log_audit

router = APIRouter()

@router.get("", response_model=List[IncidentOut])
def list_incidents(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status_filter: Optional[IncidentStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(IncidentReport)
    if state and state != "ALL":
        query = query.filter(IncidentReport.state == state)
    if district and district != "ALL":
        query = query.filter(IncidentReport.district == district)
    if status_filter:
        query = query.filter(IncidentReport.status == status_filter)
    return query.order_by(IncidentReport.created_at.desc()).all()

@router.post("", response_model=IncidentOut)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db)
):
    # Offline synchronization idempotency: check if offline_client_id already exists
    if payload.offline_client_id:
        existing = db.query(IncidentReport).filter(IncidentReport.offline_client_id == payload.offline_client_id).first()
        if existing:
            return existing

    new_id = f"INC-2026-{uuid.uuid4().hex[:6].upper()}"
    incident = IncidentReport(
        id=new_id,
        title=payload.title,
        category=payload.category,
        severity=payload.severity,
        status=IncidentStatus.REPORTED,
        road_segment_id=payload.road_segment_id,
        lat=payload.lat,
        lng=payload.lng,
        state=payload.state,
        district=payload.district,
        description=payload.description,
        reporter_name=payload.reporter_name or "Field Officer",
        reporter_phone=payload.reporter_phone,
        image_url=payload.image_url,
        offline_client_id=payload.offline_client_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_audit(db, None, "CREATE_INCIDENT_REPORT", "IncidentReport", new_id, f"Report created: {payload.title}")
    return incident

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentReport).filter(IncidentReport.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident report '{incident_id}' not found")
    return inc

@router.post("/{incident_id}/verify", response_model=IncidentOut)
def verify_incident(
    incident_id: str,
    payload: IncidentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_OFFICER, UserRole.GOVT_ADMIN, UserRole.SUPER_ADMIN]))
):
    inc = db.query(IncidentReport).filter(IncidentReport.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc.status = payload.status
    inc.verified_by_id = current_user.id
    inc.verifier_name = current_user.full_name
    inc.verification_notes = payload.verification_notes
    inc.verified_at = datetime.now(timezone.utc)

    # Optional road segment status update upon confirmation
    if payload.update_road_segment and inc.road_segment_id and payload.new_road_status:
        road = db.query(RoadSegment).filter(RoadSegment.id == inc.road_segment_id).first()
        if road:
            road.current_status = payload.new_road_status
            road.status_reason = f"Verified Incident {inc.id}: {inc.title}"
            road.last_status_update = datetime.now(timezone.utc)

            # Auto-issue alert if road is closed or restricted
            if payload.new_road_status in [RoadStatus.CLOSED, RoadStatus.RESTRICTED]:
                alert = Alert(
                    id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
                    title=f"Verified Road Obstruction: {road.highway_number} ({inc.category})",
                    message=f"{road.name} in {road.district}, {road.state} is now marked as {payload.new_road_status}. {inc.description}",
                    severity=AlertSeverity.CRITICAL if payload.new_road_status == RoadStatus.CLOSED else AlertSeverity.WARNING,
                    category=AlertCategory.ROAD_CLOSURE,
                    state=road.state,
                    district=road.district,
                    road_segment_id=road.id,
                    recommended_action="Check alternative routes on NER SmartLogistics AI.",
                    source=f"Verified by {current_user.full_name} ({current_user.department})"
                )
                db.add(alert)

    db.commit()
    db.refresh(inc)

    log_audit(db, current_user, "VERIFY_INCIDENT", "IncidentReport", inc.id, f"Incident {payload.status} by {current_user.email}")
    return inc

@router.post("/{incident_id}/resolve", response_model=IncidentOut)
def resolve_incident(
    incident_id: str,
    payload: IncidentResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_OFFICER, UserRole.GOVT_ADMIN, UserRole.SUPER_ADMIN]))
):
    inc = db.query(IncidentReport).filter(IncidentReport.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc.status = IncidentStatus.RESOLVED
    inc.resolved_at = datetime.now(timezone.utc)
    inc.verification_notes = f"{inc.verification_notes or ''}\nResolution: {payload.resolution_notes}"

    if payload.restore_road_open and inc.road_segment_id:
        road = db.query(RoadSegment).filter(RoadSegment.id == inc.road_segment_id).first()
        if road:
            road.current_status = RoadStatus.OPEN
            road.status_reason = f"Incident {inc.id} resolved: {payload.resolution_notes}"
            road.last_status_update = datetime.now(timezone.utc)

    db.commit()
    db.refresh(inc)

    log_audit(db, current_user, "RESOLVE_INCIDENT", "IncidentReport", inc.id, f"Resolved with notes: {payload.resolution_notes}")
    return inc

