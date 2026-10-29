import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from app.core.database import Base
from app.models.spatial import RiskLevel

class DisruptionPrediction(Base):
    __tablename__ = "disruption_predictions"

    id = Column(Integer, primary_key=True, index=True)
    road_segment_id = Column(String(50), ForeignKey("road_segments.id"), nullable=False, index=True)
    
    risk_probability = Column(Float, nullable=False) # e.g. 0.85
    risk_level = Column(Enum(RiskLevel), nullable=False)
    forecast_horizon_hours = Column(Integer, default=24) # 6, 12, 24, 48, 72
    
    # Contributing factors stored as JSON string (from SHAP explainability)
    # e.g. {"rainfall_24h": +0.32, "slope_degrees": +0.21, "soil_saturation": +0.15, "historical_disruptions": +0.12}
    contributing_factors_json = Column(Text, nullable=False)
    
    # Environmental snapshot at prediction time
    rainfall_current_mm = Column(Float, default=0.0)
    rainfall_antecedent_mm = Column(Float, default=0.0)
    soil_saturation_pct = Column(Float, default=50.0)
    weather_summary = Column(String(100), default="Moderate Rain")
    
    model_version = Column(String(50), default="xgb-v1.0.0-ner")
    model_type = Column(String(50), default="XGBoost Classifier")
    prediction_confidence = Column(Float, default=0.88)
    uncertainty_score = Column(Float, default=0.12)
    data_provenance = Column(String(100), default="IMD Weather + Bhuvan Terrain + Historic Incidents")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

