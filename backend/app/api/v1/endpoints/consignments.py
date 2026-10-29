from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.logistics import Consignment, ConsignmentStatus, Vehicle
from app.schemas.logistics import ConsignmentOut, ConsignmentCreate, ConsignmentStatusUpdate
from app.api.deps import log_audit

router = APIRouter()

@router.get("", response_model=List[ConsignmentOut])
def list_consignments(
    status_filter: Optional[ConsignmentStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    q = db.query(Consignment)
    if status_filter:
        q = q.filter(Consignment.status == status_filter)
    return q.order_by(Consignment.created_at.desc()).all()

@router.post("", response_model=ConsignmentOut)
def create_consignment(
    payload: ConsignmentCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Consignment).filter(Consignment.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Consignment ID already exists")

    c = Consignment(
        id=payload.id,
        title=payload.title,
        cargo_type=payload.cargo_type,
        priority=payload.priority,
        status=ConsignmentStatus.ASSIGNED if payload.assigned_vehicle_id else ConsignmentStatus.REGISTERED,
        weight_tons=payload.weight_tons,
        origin_name=payload.origin_name,
        origin_lat=payload.origin_lat,
        origin_lng=payload.origin_lng,
        destination_name=payload.destination_name,
        destination_lat=payload.destination_lat,
        destination_lng=payload.destination_lng,
        assigned_vehicle_id=payload.assigned_vehicle_id,
        expected_delivery_time=payload.expected_delivery_time,
        created_at=datetime.now(timezone.utc)
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    log_audit(db, None, "CREATE_CONSIGNMENT", "Consignment", c.id, f"Registered: {c.title}")
    return c

@router.get("/{consignment_id}", response_model=ConsignmentOut)
def get_consignment(consignment_id: str, db: Session = Depends(get_db)):
    c = db.query(Consignment).filter(Consignment.id == consignment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consignment not found")
    return c

@router.patch("/{consignment_id}/status", response_model=ConsignmentOut)
def update_consignment_status(
    consignment_id: str,
    payload: ConsignmentStatusUpdate,
    db: Session = Depends(get_db)
):
    c = db.query(Consignment).filter(Consignment.id == consignment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consignment not found")

    c.status = payload.status
    if payload.assigned_vehicle_id:
        c.assigned_vehicle_id = payload.assigned_vehicle_id
    if payload.status == ConsignmentStatus.DELIVERED:
        c.actual_delivery_time = datetime.now(timezone.utc)

    db.commit()
    db.refresh(c)
    return c

