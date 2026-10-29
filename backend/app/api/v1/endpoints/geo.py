from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.spatial import State, District, RoadSegment, Bridge, RoadStatus, RiskLevel
from app.models.user import User, UserRole
from app.schemas.spatial import StateOut, DistrictOut, RoadSegmentOut, RoadSegmentStatusUpdate, BridgeOut
from app.api.deps import get_current_user, require_roles, log_audit

router = APIRouter()

@router.get("/states", response_model=List[StateOut])
def list_states(db: Session = Depends(get_db)):
    return db.query(State).all()

@router.get("/districts", response_model=List[DistrictOut])
def list_districts(
    state: Optional[str] = Query(None, description="Filter by state name"),
    db: Session = Depends(get_db)
):
    query = db.query(District)
    if state and state != "ALL":
        query = query.filter(District.state_name == state)
    return query.all()

@router.get("/road-segments", response_model=List[RoadSegmentOut])
def list_road_segments(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status_filter: Optional[RoadStatus] = Query(None, alias="status"),
    risk_level: Optional[RiskLevel] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(RoadSegment)
    if state and state != "ALL":
        query = query.filter(RoadSegment.state == state)
    if district and district != "ALL":
        query = query.filter(RoadSegment.district == district)
    if status_filter:
        query = query.filter(RoadSegment.current_status == status_filter)
    if risk_level:
        query = query.filter(RoadSegment.current_risk_level == risk_level)
    return query.all()

@router.get("/road-segments/{segment_id}", response_model=RoadSegmentOut)
def get_road_segment(segment_id: str, db: Session = Depends(get_db)):
    segment = db.query(RoadSegment).filter(RoadSegment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail=f"Road segment '{segment_id}' not found")
    return segment

@router.patch("/road-segments/{segment_id}/status", response_model=RoadSegmentOut)
def update_road_segment_status(
    segment_id: str,
    payload: RoadSegmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_OFFICER, UserRole.GOVT_ADMIN, UserRole.SUPER_ADMIN]))
):
    segment = db.query(RoadSegment).filter(RoadSegment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail=f"Road segment '{segment_id}' not found")

    old_status = segment.current_status
    segment.current_status = payload.status
    segment.status_reason = payload.reason
    segment.last_status_update = datetime.now(timezone.utc)
    db.commit()
    db.refresh(segment)

    log_audit(
        db, current_user, "UPDATE_ROAD_STATUS", "RoadSegment", segment_id,
        f"Status changed from {old_status} to {payload.status}. Reason: {payload.reason}"
    )
    return segment

@router.get("/bridges", response_model=List[BridgeOut])
def list_bridges(
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Bridge)
    if state and state != "ALL":
        query = query.filter(Bridge.state == state)
    return query.all()

