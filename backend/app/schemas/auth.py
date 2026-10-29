from typing import Optional
from pydantic import BaseModel
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    user_id: int
    email: str
    role: str
    full_name: str
    department: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    role: UserRole = UserRole.PUBLIC_VIEWER
    department: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    phone_number: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: UserRole
    department: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
