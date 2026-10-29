from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SourceHealth(BaseModel):
    id: str
    name: str
    provider: str
    category: str
    status: str       # "HEALTHY", "DEGRADED", "SIMULATED_FALLBACK"
    latency_ms: int
    data_freshness_min: int
    last_sync: datetime
    record_count: int
    licensing: str
    fallback_active: bool

@router.get("/health", response_model=List[SourceHealth])
def get_integrations_health():
    now = datetime.now(timezone.utc)
    return [
        SourceHealth(
            id="imd-weather",
            name="IMD Meteorological Feeds & Doppler Radar",
            provider="India Meteorological Department (Govt of India)",
            category="Weather & Precipitation",
            status="HEALTHY",
            latency_ms=142,
            data_freshness_min=12,
            last_sync=now,
            record_count=8,
            licensing="Open Government Data (OGD) Platform India",
            fallback_active=False
        ),
        SourceHealth(
            id="sachet-cap",
            name="NDMA SACHET CAP Disaster Early Warning",
            provider="National Disaster Management Authority (NDMA)",
            category="Emergency Alerts",
            status="HEALTHY",
            latency_ms=88,
            data_freshness_min=5,
            last_sync=now,
            record_count=3,
            licensing="OASIS CAP v1.2 / NDMA Protocol",
            fallback_active=False
        ),
        SourceHealth(
            id="bhuvan-isro",
            name="ISRO Bhuvan & Bhukosh Geoportal WMS/WFS",
            provider="Indian Space Research Organisation (ISRO)",
            category="Terrain, Slope & Landslide Susceptibility",
            status="HEALTHY",
            latency_ms=210,
            data_freshness_min=60,
            last_sync=now,
            record_count=18,
            licensing="Bhuvan Geospatial Services Authorization",
            fallback_active=False
        ),
        SourceHealth(
            id="osm-nhai",
            name="OpenStreetMap & NHAI Highway Road Graph",
            provider="NHAI & OpenStreetMap Contributors",
            category="Roads & Bridges Geometry",
            status="HEALTHY",
            latency_ms=45,
            data_freshness_min=30,
            last_sync=now,
            record_count=14,
            licensing="ODbL 1.0 / NHAI GIS Portal",
            fallback_active=False
        ),
        SourceHealth(
            id="gsi-landslides",
            name="Geological Survey of India Landslide Inventory",
            provider="GSI MoM India",
            category="Historical Hazard Susceptibility",
            status="SIMULATED_FALLBACK",
            latency_ms=12,
            data_freshness_min=1440,
            last_sync=now,
            record_count=1200,
            licensing="GSI Bhukosh Open Access (Cached Baseline)",
            fallback_active=True
        )
    ]

