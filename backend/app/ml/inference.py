import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.models.spatial import RiskLevel

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "xgb_disruption_model.joblib")
EXPLAINER_PATH = os.path.join(ARTIFACTS_DIR, "shap_explainer.joblib")

_model = None
_explainer = None

FEATURE_NAMES = [
    "rainfall_24h_mm", "rainfall_antecedent_mm", "slope_degrees",
    "elevation_m", "soil_saturation_pct", "dist_river_km",
    "road_class", "hist_disruptions"
]

def load_ml_pipeline():
    global _model, _explainer
    if _model is None and os.path.exists(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
    if _explainer is None and os.path.exists(EXPLAINER_PATH):
        _explainer = joblib.load(EXPLAINER_PATH)
    return _model, _explainer

def predict_segment_disruption(
    rainfall_24h_mm: float,
    rainfall_antecedent_mm: float,
    slope_degrees: float,
    elevation_m: float,
    soil_saturation_pct: float,
    dist_river_km: float,
    road_class: int = 0,
    hist_disruptions: int = 1
) -> Tuple[float, RiskLevel, Dict[str, float], float]:
    """
    Predict disruption probability and explain through SHAP feature importance.
    Returns: (probability, RiskLevel, shap_contributions, uncertainty)
    """
    model, explainer = load_ml_pipeline()
    
    input_data = pd.DataFrame([{
        "rainfall_24h_mm": float(rainfall_24h_mm),
        "rainfall_antecedent_mm": float(rainfall_antecedent_mm),
        "slope_degrees": float(slope_degrees),
        "elevation_m": float(elevation_m),
        "soil_saturation_pct": float(soil_saturation_pct),
        "dist_river_km": float(dist_river_km),
        "road_class": int(road_class),
        "hist_disruptions": int(hist_disruptions)
    }])

    if model is not None:
        proba = float(model.predict_proba(input_data)[0, 1])
    else:
        # Transparent rule-based fallback if ML artifact is uninitialized
        hazard = (rainfall_24h_mm / 150.0) * 0.4 + (slope_degrees / 40.0) * 0.3 + (soil_saturation_pct / 100.0) * 0.3
        proba = min(max(hazard, 0.05), 0.95)

    # Risk level thresholding
    if proba >= 0.80:
        level = RiskLevel.SEVERE
    elif proba >= 0.55:
        level = RiskLevel.HIGH
    elif proba >= 0.30:
        level = RiskLevel.MEDIUM
    else:
        level = RiskLevel.LOW

    # Calculate SHAP explainability
    shap_contributions = {}
    if explainer is not None:
        try:
            shap_values = explainer(input_data)
            values = shap_values.values[0]
            for name, val in zip(FEATURE_NAMES, values):
                shap_contributions[name] = round(float(val), 3)
        except Exception:
            shap_contributions = {
                "rainfall_24h_mm": round(rainfall_24h_mm / 150.0 * 0.4, 3),
                "slope_degrees": round(slope_degrees / 40.0 * 0.3, 3),
                "soil_saturation_pct": round(soil_saturation_pct / 100.0 * 0.3, 3)
            }
    else:
        shap_contributions = {
            "rainfall_24h_mm": round(rainfall_24h_mm / 150.0 * 0.4, 3),
            "slope_degrees": round(slope_degrees / 40.0 * 0.3, 3),
            "soil_saturation_pct": round(soil_saturation_pct / 100.0 * 0.3, 3)
        }

    # Uncertainty inversely proportional to data confidence
    uncertainty = round(abs(0.5 - abs(proba - 0.5)) * 0.4, 3)

    return round(proba, 3), level, shap_contributions, uncertainty

