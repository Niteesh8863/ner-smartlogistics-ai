from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.auth import UserOut, UserCreate
from app.api.deps import require_roles, log_audit

router = APIRouter()

@router.get("", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.GOVT_ADMIN]))
):
    return db.query(User).all()

@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        department=payload.department,
        state=payload.state,
        district=payload.district,
        phone_number=payload.phone_number
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit(db, current_user, "CREATE_USER", "User", str(user.id), f"Created user {user.email} with role {user.role}")
    return user

