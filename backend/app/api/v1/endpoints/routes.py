from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.spatial import RoutePlanRequest, RoutePlanResponse
from app.services.routing_engine import RiskAwareRoutingEngine

router = APIRouter()

@router.post("/plan", response_model=RoutePlanResponse)
def plan_route(
    payload: RoutePlanRequest,
    db: Session = Depends(get_db)
):
    engine = RiskAwareRoutingEngine(db)
    alternatives = engine.plan_route(
        origin_lat=payload.origin_lat,
        origin_lng=payload.origin_lng,
        dest_lat=payload.destination_lat,
        dest_lng=payload.destination_lng,
        cargo_type=payload.cargo_type,
        alpha_time=payload.alpha_time,
        beta_risk=payload.beta_risk,
        gamma_dist=payload.gamma_dist
    )

    if not alternatives:
        return RoutePlanResponse(
            origin=payload.origin_name,
            destination=payload.destination_name,
            cargo_type=payload.cargo_type,
            primary_route=None,
            safer_route=None,
            alternatives=[],
            warning_message="NO FEASIBLE SAFE ROUTE FOUND: All connecting corridors are closed or blocked by hazardous landslides. Emergency airlift or clearance required.",
            data_freshness_timestamp=datetime.now(timezone.utc)
        )

    primary = alternatives[0]
    safer = alternatives[1] if len(alternatives) > 1 else None

    warning = None
    if primary.passes_closed_roads:
        warning = "CRITICAL SAFETY WARNING: Primary path encounters confirmed closed road sections. Exercise extreme caution."

    return RoutePlanResponse(
        origin=payload.origin_name,
        destination=payload.destination_name,
        cargo_type=payload.cargo_type,
        primary_route=primary,
        safer_route=safer,
        alternatives=alternatives,
        warning_message=warning,
        data_freshness_timestamp=datetime.now(timezone.utc)
    )

