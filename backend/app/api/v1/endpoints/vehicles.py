from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.logistics import Vehicle, TelemetryPoint, VehicleStatus
from app.schemas.logistics import VehicleOut, VehicleLocationUpdate, TelemetryPointOut

router = APIRouter()

@router.get("", response_model=List[VehicleOut])
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.post("/{vehicle_id}/telemetry", response_model=VehicleOut)
def ingest_telemetry(
    vehicle_id: str,
    payload: VehicleLocationUpdate,
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Anomaly detection: Stalled in transit
    is_anomaly = False
    anomaly_reason = None
    if payload.speed_kmh < 2.0 and v.status == VehicleStatus.IN_TRANSIT:
        is_anomaly = True
        anomaly_reason = "Vehicle stopped/stalled along active transit route"
        v.status = VehicleStatus.STALLED
    elif payload.speed_kmh >= 10.0:
        v.status = VehicleStatus.IN_TRANSIT
        is_anomaly = False
        anomaly_reason = None

    v.current_lat = payload.lat
    v.current_lng = payload.lng
    v.current_speed_kmh = payload.speed_kmh
    v.current_heading = payload.heading
    v.is_anomaly = is_anomaly
    v.anomaly_reason = anomaly_reason
    v.last_telemetry_time = datetime.now(timezone.utc)

    # Record historical telemetry
    pt = TelemetryPoint(
        vehicle_id=v.id,
        lat=payload.lat,
        lng=payload.lng,
        speed_kmh=payload.speed_kmh,
        heading=payload.heading,
        is_anomaly=is_anomaly,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(pt)
    db.commit()
    db.refresh(v)
    return v

@router.get("/{vehicle_id}/history", response_model=List[TelemetryPointOut])
def get_vehicle_history(
    vehicle_id: str,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    return db.query(TelemetryPoint).filter(
        TelemetryPoint.vehicle_id == vehicle_id
    ).order_by(TelemetryPoint.timestamp.desc()).limit(limit).all()

