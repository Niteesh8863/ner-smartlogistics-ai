import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NER SmartLogistics AI"
    PROJECT_DESCRIPTION: str = "SIH26002 AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ner-smartlogistics-secure-secret-key-capstone-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database: Default to local SQLite for instant zero-config demonstration, switchable to PostGIS via .env
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./smartlogistics.db"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Demonstration & Simulation Mode
    DEMO_MODE: bool = True
    SIMULATE_TELEMETRY: bool = True
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

