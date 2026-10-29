import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    GOVT_ADMIN = "GOVT_ADMIN"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    FIELD_OFFICER = "FIELD_OFFICER"
    LOGISTICS_OPERATOR = "LOGISTICS_OPERATOR"
    PUBLIC_VIEWER = "PUBLIC_VIEWER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PUBLIC_VIEWER, nullable=False)
    department = Column(String(150), nullable=True)
    state = Column(String(100), nullable=True)     # For NER state filtering
    district = Column(String(100), nullable=True)  # For district level filtering
    phone_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

