from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    dashboard,
    geo,
    incidents,
    predictions,
    routes,
    vehicles,
    consignments,
    alerts,
    integrations,
    audit_logs
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Access"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Government Command Center"])
api_router.include_router(geo.router, prefix="/geo", tags=["Geospatial & Road Accessibility"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Field Incident Reporting & Verification"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["AI Disruption Prediction & SHAP"])
api_router.include_router(routes.router, prefix="/routes", tags=["Risk-Aware Route Optimization"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Fleet & Telemetry Tracking"])
api_router.include_router(consignments.router, prefix="/consignments", tags=["Essential Goods Consignments"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Emergency Alerts & Early Warning"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["Data Integration Layer & Health"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Security & Audit Logs"])

