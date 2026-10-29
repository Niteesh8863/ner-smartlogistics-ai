from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.api import api_router
from app.seed.seed_data import init_db

# Initialize database schema & seed if not present
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to settings.BACKEND_CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "problem_statement": "SIH26002 - AI-Based Smart Logistics and Accessibility Intelligence Platform for NER",
        "ministry": "Ministry of Development of North Eastern Region (MDoNER)",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "OPERATIONAL"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

