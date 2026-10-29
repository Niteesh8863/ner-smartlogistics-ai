from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.alert import Alert, AlertSeverity, AlertCategory
from app.models.user import User, UserRole
from app.schemas.alert import AlertOut, AlertCreate
from app.api.deps import require_roles, log_audit

router = APIRouter()

@router.get("", response_model=List[AlertOut])
def list_alerts(
    state: Optional[str] = Query(None),
    severity: Optional[AlertSeverity] = Query(None),
    category: Optional[AlertCategory] = Query(None),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    q = db.query(Alert)
    if active_only:
        q = q.filter(Alert.is_active == True)
    if state and state != "ALL":
        q = q.filter(Alert.state == state)
    if severity:
        q = q.filter(Alert.severity == severity)
    if category:
        q = q.filter(Alert.category == category)
    return q.order_by(Alert.created_at.desc()).all()

@router.post("", response_model=AlertOut)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_OFFICER, UserRole.GOVT_ADMIN, UserRole.SUPER_ADMIN]))
):
    new_id = f"ALT-{uuid.uuid4().hex[:6].upper()}"
    alert = Alert(
        id=new_id,
        title=payload.title,
        message=payload.message,
        severity=payload.severity,
        category=payload.category,
        state=payload.state,
        district=payload.district,
        road_segment_id=payload.road_segment_id,
        recommended_action=payload.recommended_action,
        source=payload.source or f"Alert by {current_user.full_name}",
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
        expires_at=payload.expires_at
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    log_audit(db, current_user, "CREATE_ALERT", "Alert", new_id, f"Issued: {payload.title}")
    return alert

@router.patch("/{alert_id}/dismiss", response_model=AlertOut)
def dismiss_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_OFFICER, UserRole.GOVT_ADMIN, UserRole.SUPER_ADMIN]))
):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.is_active = False
    db.commit()
    db.refresh(a)
    return a

