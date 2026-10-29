from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import Token, LoginRequest, RefreshTokenRequest, UserOut
from app.api.deps import get_current_user, log_audit

router = APIRouter()

@router.post("/login", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == payload.username_or_email) | (User.username == payload.username_or_email)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    log_audit(db, user, "LOGIN_SUCCESS", "User", str(user.id), f"User {user.email} logged in successfully")

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
        full_name=user.full_name,
        department=user.department,
        state=user.state,
        district=user.district
    )

@router.post("/login-form", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
        full_name=user.full_name,
        department=user.department,
        state=user.state,
        district=user.district
    )

@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = decoded.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
        full_name=user.full_name,
        department=user.department,
        state=user.state,
        district=user.district
    )

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

