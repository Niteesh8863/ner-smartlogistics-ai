from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.spatial import RiskLevel

class DisruptionPredictionOut(BaseModel):
    id: int
    road_segment_id: str
    risk_probability: float
    risk_level: RiskLevel
    forecast_horizon_hours: int
    contributing_factors: Dict[str, float]
    rainfall_current_mm: float
    rainfall_antecedent_mm: float
    soil_saturation_pct: float
    weather_summary: str
    model_version: str
    model_type: str
    prediction_confidence: float
    uncertainty_score: float
    data_provenance: str
    created_at: datetime

    class Config:
        from_attributes = True

class PredictRequest(BaseModel):
    road_segment_id: str
    forecast_horizon_hours: int = 24
    rainfall_current_mm: Optional[float] = None
    rainfall_antecedent_mm: Optional[float] = None
    soil_saturation_pct: Optional[float] = None

class ModelHealthOut(BaseModel):
    model_name: str
    version: str
    status: str
    last_trained: datetime
    test_recall_24h: float
    test_precision: float
    test_f1: float
    test_pr_auc: float
    forecast_horizon_hours: int
    supported_horizons: List[int]

