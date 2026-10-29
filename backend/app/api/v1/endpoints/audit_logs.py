from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditLog
from app.models.user import User, UserRole
from app.api.deps import require_roles

router = APIRouter()

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    user_email: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    limit: int = Query(100, le=500),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.GOVT_ADMIN]))
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()

