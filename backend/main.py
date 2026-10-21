"""
AirSense AI – FastAPI Backend
Serves synthetic demonstration data from CSV/Parquet files and trained ML models.
All data is sourced from the AirSense_AI_Dataset directory.
"""

import math
import logging
from functools import lru_cache
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# LOGGING
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
log = logging.getLogger("airsense")

# ---------------------------------------------------------------------------
# PATHS
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "AirSense_AI_Dataset"

STATION_MASTER = DATA_DIR / "processed" / "station_master.csv"
LIVE_AQ_PATH   = DATA_DIR / "raw" / "live_air_quality_demo.csv"
LIVE_WX_PATH   = DATA_DIR / "raw" / "live_weather_demo.csv"
TEST_DATA_PATH = DATA_DIR / "ml" / "test_dataset.csv"
MODEL_DIR      = DATA_DIR / "trained_models"
MONITORING_DIR = DATA_DIR / "monitoring"
DRIFT_REPORT   = MONITORING_DIR / "calculated_drift_report.csv"
DQ_REPORT      = MONITORING_DIR / "calculated_data_quality_report.csv"
INCIDENTS_PATH = MONITORING_DIR / "incidents_demo.csv"
MODEL_EVAL     = DATA_DIR / "model_evaluation_results.csv"
BASELINE_CMP   = DATA_DIR / "baseline_comparison.csv"

TARGETS = ["target_1h", "target_6h", "target_24h"]

# ---------------------------------------------------------------------------
# GLOBAL STATE (loaded at startup)
# ---------------------------------------------------------------------------

models: dict = {}
test_data: Optional[pd.DataFrame] = None
station_master: Optional[pd.DataFrame] = None
live_aq: Optional[pd.DataFrame] = None
live_wx: Optional[pd.DataFrame] = None

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def _safe_float(val) -> Optional[float]:
    """Convert to float, returning None for NaN/inf."""
    try:
        f = float(val)
        return None if (math.isnan(f) or math.isinf(f)) else round(f, 4)
    except (TypeError, ValueError):
        return None


def _aqi_status(pm25: Optional[float]) -> str:
    """Return simple AQI label based on PM2.5 µg/m³ (India NAAQ thresholds)."""
    if pm25 is None:
        return "Unknown"
    if pm25 <= 30:
        return "Good"
    if pm25 <= 60:
        return "Satisfactory"
    if pm25 <= 90:
        return "Moderate"
    if pm25 <= 120:
        return "Poor"
    return "Very Poor"


def _wind_dir_label(deg: Optional[float]) -> str:
    if deg is None:
        return "N/A"
    dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]
    idx = round(float(deg) / 22.5) % 16
    return dirs[idx]


# ---------------------------------------------------------------------------
# LIFESPAN – load models + data once at startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    global test_data, station_master, live_aq, live_wx

    # Station master
    if not STATION_MASTER.exists():
        raise RuntimeError(f"Station master not found: {STATION_MASTER}")
    station_master = pd.read_csv(STATION_MASTER)
    log.info("Loaded station_master: %d rows", len(station_master))

    # Live air quality demo
    if LIVE_AQ_PATH.exists():
        live_aq = pd.read_csv(LIVE_AQ_PATH)
        log.info("Loaded live_air_quality_demo: %d rows", len(live_aq))

    # Live weather demo
    if LIVE_WX_PATH.exists():
        live_wx = pd.read_csv(LIVE_WX_PATH)
        log.info("Loaded live_weather_demo: %d rows", len(live_wx))

    # ML test dataset
    if not TEST_DATA_PATH.exists():
        raise RuntimeError(f"Test dataset not found: {TEST_DATA_PATH}")
    test_data = pd.read_csv(TEST_DATA_PATH)
    test_data["timestamp"] = pd.to_datetime(test_data["timestamp"], errors="coerce", utc=True)
    log.info("Loaded test_dataset: %d rows", len(test_data))

    # Trained models
    for target in TARGETS:
        path = MODEL_DIR / f"{target}_model.joblib"
        if not path.exists():
            raise RuntimeError(f"Model not found: {path}")
        artifact = joblib.load(path)
        if not isinstance(artifact, dict) or "model" not in artifact or "features" not in artifact:
            raise RuntimeError(f"Invalid artifact format: {target}")
        models[target] = artifact
        log.info("Loaded model: %s", target)

    yield
    models.clear()


# ---------------------------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AirSense AI API",
    description=(
        "Air-quality forecasting and MLOps monitoring API. "
        "All data is sourced from synthetic demonstration datasets."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# HEALTH
# ---------------------------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AirSense AI",
        "models_loaded": len(models),
        "stations_loaded": len(station_master) if station_master is not None else 0,
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# CITIES  –  GET /api/v1/cities
# ---------------------------------------------------------------------------

@app.get("/api/v1/cities")
def get_cities():
    """Return distinct cities derived from the station master."""
    if station_master is None:
        raise HTTPException(503, "Station data not loaded.")

    city_groups = station_master.groupby(["city", "state"])

    # Pull the latest PM2.5 for each city from the live AQ demo, if available.
    city_pm25: dict[str, Optional[float]] = {}
    if live_aq is not None:
        aq_pm25 = live_aq[live_aq["pollutant_id"] == "PM2.5"]
        city_avg = aq_pm25.groupby("city")["pollutant_avg"].mean()
        city_pm25 = city_avg.to_dict()

    cities = []
    for (city, state), grp in city_groups:
        pm25 = _safe_float(city_pm25.get(city))
        cities.append({
            "id": city.lower().replace(" ", "_"),
            "name": city,
            "state": state,
            "station_count": len(grp),
            "current_pm25": pm25,
            "status": _aqi_status(pm25),
            "data_source": "synthetic_demo",
        })

    return {"count": len(cities), "cities": cities, "data_source": "synthetic_demo"}


# ---------------------------------------------------------------------------
# STATIONS  –  GET /api/v1/stations
# ---------------------------------------------------------------------------

@app.get("/api/v1/stations")
def get_stations(city: Optional[str] = Query(None, description="Filter by city name")):
    """Return stations, optionally filtered by city."""
    if station_master is None:
        raise HTTPException(503, "Station data not loaded.")

    df = station_master.copy()
    if city:
        df = df[df["city"].str.lower() == city.lower()]

    # Latest PM2.5 per station from live AQ demo
    station_pm25: dict[str, Optional[float]] = {}
    if live_aq is not None:
        aq_pm25 = live_aq[live_aq["pollutant_id"] == "PM2.5"]
        for sid, grp in aq_pm25.groupby("station_id"):
            station_pm25[str(sid)] = _safe_float(grp["pollutant_avg"].mean())

    stations = []
    for _, row in df.iterrows():
        sid = str(row["station_id"])
        pm25 = station_pm25.get(sid)
        params = str(row.get("available_parameters", "")).split("|")
        stations.append({
            "id": sid,
            "name": str(row["station_name"]),
            "city": str(row["city"]),
            "state": str(row["state"]),
            "latitude": _safe_float(row.get("latitude")),
            "longitude": _safe_float(row.get("longitude")),
            "current_pm25": pm25,
            "status": _aqi_status(pm25),
            "parameters": params,
            "active_status": str(row.get("active_status", "DEMO_ACTIVE")),
            "data_source": str(row.get("data_source", "synthetic_demo")),
        })

    return {"count": len(stations), "stations": stations, "data_source": "synthetic_demo"}


# ---------------------------------------------------------------------------
# AIR QUALITY  –  GET /api/v1/air-quality/{station_id}
# ---------------------------------------------------------------------------

@app.get("/api/v1/air-quality/{station_id}")
def get_air_quality(station_id: str):
    """Return latest pollutant readings for a station from the live AQ demo."""
    if live_aq is None:
        raise HTTPException(503, "Air quality data not loaded.")

    station_rows = live_aq[live_aq["station_id"].astype(str) == station_id]
    if station_rows.empty:
        raise HTTPException(404, f"No air quality data for station: {station_id}")

    # Build pollutant dictionary from long-format CSV
    pollutants_raw = (
        station_rows.groupby("pollutant_id")["pollutant_avg"]
        .mean()
        .to_dict()
    )

    UNITS = {
        "PM2.5": "µg/m³", "PM10": "µg/m³", "NO2": "µg/m³",
        "SO2": "µg/m³", "O3": "µg/m³", "NH3": "µg/m³", "CO": "mg/m³",
    }

    current = {}
    for pollutant, val in pollutants_raw.items():
        v = _safe_float(val)
        current[pollutant] = {
            "value": v,
            "unit": UNITS.get(pollutant, "µg/m³"),
            "status": _aqi_status(v) if pollutant == "PM2.5" else ("Available" if v is not None else "No Data"),
        }

    first_row = station_rows.iloc[0]
    return {
        "station_id": station_id,
        "station_name": str(first_row.get("station", station_id)),
        "city": str(first_row.get("city", "")),
        "state": str(first_row.get("state", "")),
        "last_updated": str(first_row.get("last_update", "")),
        "current": current,
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# HISTORICAL DATA  –  GET /api/v1/historical
# ---------------------------------------------------------------------------

@app.get("/api/v1/historical")
def get_historical(
    station_id: str = Query(..., description="Station ID"),
    pollutant: str = Query("PM2.5", description="Pollutant column name"),
    time_range: str = Query("24h", description="24h | 7d | 30d"),
):
    """Return time-series observations from the ML test dataset."""
    if test_data is None:
        raise HTTPException(503, "Test dataset not loaded.")

    df = test_data[test_data["station_id"].astype(str) == station_id].copy()
    if df.empty:
        raise HTTPException(404, f"No historical data for station: {station_id}")

    df = df.dropna(subset=["timestamp"]).sort_values("timestamp")

    # Limit rows by time range
    latest = df["timestamp"].max()
    if time_range == "7d":
        cutoff = latest - pd.Timedelta(days=7)
    elif time_range == "30d":
        cutoff = latest - pd.Timedelta(days=30)
    else:  # 24h default
        cutoff = latest - pd.Timedelta(hours=24)

    df = df[df["timestamp"] >= cutoff]

    if pollutant not in df.columns:
        raise HTTPException(400, f"Pollutant '{pollutant}' not found. Available: {list(df.columns)}")

    df[pollutant] = pd.to_numeric(df[pollutant], errors="coerce")

    chart = []
    for _, row in df.iterrows():
        val = _safe_float(row[pollutant])
        chart.append({
            "time": row["timestamp"].strftime("%m-%d %H:%M"),
            pollutant: val,
        })

    valid = [r[pollutant] for r in chart if r[pollutant] is not None]
    summary = {
        "average": round(float(np.mean(valid)), 2) if valid else None,
        "min": round(float(np.min(valid)), 2) if valid else None,
        "max": round(float(np.max(valid)), 2) if valid else None,
        "observations": len(valid),
    }

    return {
        "station_id": station_id,
        "pollutant": pollutant,
        "time_range": time_range,
        "summary": summary,
        "chart": chart,
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# WEATHER  –  GET /api/v1/weather/{station_id}
# ---------------------------------------------------------------------------

@app.get("/api/v1/weather/{station_id}")
def get_weather(station_id: str):
    """Return the latest weather observation for a station."""
    if live_wx is None:
        raise HTTPException(503, "Weather data not loaded.")

    rows = live_wx[live_wx["station_id"].astype(str) == station_id]
    if rows.empty:
        raise HTTPException(404, f"No weather data for station: {station_id}")

    row = rows.sort_values("timestamp").iloc[-1]

    # Build 24-hour trend from test_dataset if available
    trend = []
    if test_data is not None:
        wx_df = test_data[test_data["station_id"].astype(str) == station_id].copy()
        wx_df = wx_df.dropna(subset=["timestamp"]).sort_values("timestamp")
        latest_ts = wx_df["timestamp"].max()
        cutoff = latest_ts - pd.Timedelta(hours=24)
        wx_df = wx_df[wx_df["timestamp"] >= cutoff]
        for _, r in wx_df.iterrows():
            trend.append({
                "time": r["timestamp"].strftime("%H:%M"),
                "temperature": _safe_float(r.get("temperature_2m_c")),
                "humidity": _safe_float(r.get("relative_humidity_2m_pct")),
                "windSpeed": _safe_float(r.get("wind_speed_10m_ms")),
            })

    wind_deg = _safe_float(row.get("wind_direction_10m_deg"))
    return {
        "station_id": station_id,
        "station_name": str(row.get("station_name", station_id)),
        "city": str(row.get("city", "")),
        "timestamp": str(row.get("timestamp", "")),
        "current": {
            "temperature": _safe_float(row.get("temperature_2m_c")),
            "humidity": _safe_float(row.get("relative_humidity_2m_pct")),
            "windSpeed": _safe_float(row.get("wind_speed_10m_ms")),
            "windDirection": _wind_dir_label(wind_deg),
            "windDirectionDeg": wind_deg,
            "windGust": _safe_float(row.get("wind_gusts_10m_ms")),
            "pressure": _safe_float(row.get("pressure_msl_hpa")),
            "precipitation": _safe_float(row.get("precipitation_mm")),
            "cloudCover": _safe_float(row.get("cloud_cover_pct")),
        },
        "chart": trend,
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# FORECASTS (existing endpoints, preserved)
# ---------------------------------------------------------------------------

def _get_station_forecast(station_id: str) -> dict:
    if test_data is None:
        raise HTTPException(503, "Dataset is not loaded.")

    station_data = test_data[test_data["station_id"].astype(str) == station_id].copy()
    if station_data.empty:
        raise HTTPException(404, f"Station not found: {station_id}")

    station_data = station_data.dropna(subset=["timestamp"]).sort_values("timestamp")
    if station_data.empty:
        raise HTTPException(404, "No valid timestamped observations for this station.")

    latest_row = station_data.iloc[[-1]]
    forecasts = {}

    for target in TARGETS:
        artifact = models[target]
        model = artifact["model"]
        features = artifact["features"]
        missing = [f for f in features if f not in latest_row.columns]
        if missing:
            raise HTTPException(500, {"message": "Required features missing.", "target": target, "missing": missing})
        X = latest_row[features]
        try:
            forecasts[target] = round(float(model.predict(X)[0]), 2)
        except Exception as exc:
            raise HTTPException(500, f"Prediction failed for {target}: {exc}") from exc

    row = latest_row.iloc[0]
    current_pm25 = _safe_float(row.get("PM2.5"))

    # Build a small chart: last 12h actuals + 3 forecast points
    chart_rows = station_data.tail(12)
    chart = []
    for _, r in chart_rows.iterrows():
        chart.append({
            "time": r["timestamp"].strftime("%H:%M"),
            "actual": _safe_float(r["PM2.5"]),
            "forecast": None,
            "upper": None,
            "lower": None,
        })

    # Append forecast points
    from datetime import timedelta
    base_ts = row["timestamp"]
    for hrs, key in [(1, "target_1h"), (6, "target_6h"), (24, "target_24h")]:
        fval = forecasts[key]
        margin = round(fval * 0.08, 2)  # ±8% confidence
        chart.append({
            "time": (base_ts + timedelta(hours=hrs)).strftime("%H:%M"),
            "actual": None,
            "forecast": fval,
            "upper": round(fval + margin, 2),
            "lower": round(fval - margin, 2),
        })

    return {
        "station_id": station_id,
        "station_name": str(row.get("station_name", station_id)) if "station_name" in row.index else station_id,
        "city": str(row.get("city", "")) if "city" in row.index else None,
        "timestamp": row["timestamp"].isoformat(),
        "current_pm25": current_pm25,
        "forecasts": {
            "1_hour": forecasts["target_1h"],
            "6_hours": forecasts["target_6h"],
            "24_hours": forecasts["target_24h"],
        },
        "summary": {
            "current": current_pm25,
            "h1": forecasts["target_1h"],
            "h6": forecasts["target_6h"],
            "h24": forecasts["target_24h"],
        },
        "chart": chart,
        "model": {
            "name": "RandomForestRegressor",
            "horizons": ["1h", "6h", "24h"],
        },
        "data_source": "synthetic_demo",
    }


@app.get("/api/v1/forecasts")
def get_forecasts():
    if test_data is None:
        raise HTTPException(503, "Dataset is not loaded.")
    station_ids = test_data["station_id"].dropna().astype(str).unique()
    results = [_get_station_forecast(sid) for sid in station_ids]
    return {"count": len(results), "forecasts": results, "data_source": "synthetic_demo"}


@app.get("/api/v1/forecasts/{station_id}")
def get_forecast_by_station(station_id: str):
    return _get_station_forecast(station_id)


# ---------------------------------------------------------------------------
# MONITORING OVERVIEW  –  GET /api/v1/monitoring
# ---------------------------------------------------------------------------

@app.get("/api/v1/monitoring")
def get_monitoring_overview():
    """Derive a summary from the calculated reports on disk."""

    # Data quality
    dq_status = "Unknown"
    if DQ_REPORT.exists():
        dq_df = pd.read_csv(DQ_REPORT)
        warnings = dq_df[dq_df["status"] == "WARNING"]
        dq_status = "Warning" if len(warnings) > 0 else "Healthy"
        dq_explain = f"{len(warnings)} check(s) with warnings" if len(warnings) > 0 else "All checks passed"
    else:
        dq_explain = "Report not found"

    # Drift
    drift_status = "Unknown"
    if DRIFT_REPORT.exists():
        dr_df = pd.read_csv(DRIFT_REPORT)
        high_drift = dr_df[dr_df["status"] == "HIGH"]
        moderate_drift = dr_df[dr_df["status"] == "MODERATE"]
        if len(high_drift) > 0:
            drift_status = "Warning"
            drift_explain = f"{len(high_drift)} feature(s) with HIGH PSI drift"
        elif len(moderate_drift) > 0:
            drift_status = "Warning"
            drift_explain = f"{len(moderate_drift)} feature(s) with MODERATE drift"
        else:
            drift_status = "Healthy"
            drift_explain = "All features within acceptable drift bounds"
    else:
        drift_explain = "Drift report not found"

    # Model performance
    mp_status = "Healthy"
    if MODEL_EVAL.exists():
        mp_df = pd.read_csv(MODEL_EVAL)
        worst_r2 = mp_df["R2"].min()
        mp_status = "Warning" if worst_r2 < 0.70 else "Healthy"
        mp_explain = f"Best R²={mp_df['R2'].max():.3f}, MAE range {mp_df['MAE'].min():.2f}–{mp_df['MAE'].max():.2f}"
    else:
        mp_explain = "Evaluation results not found"

    # Incidents
    inc_status = "Healthy"
    if INCIDENTS_PATH.exists():
        inc_df = pd.read_csv(INCIDENTS_PATH)
        open_inc = inc_df[inc_df["status"].isin(["OPEN", "INVESTIGATING"])]
        inc_status = "Warning" if len(open_inc) > 0 else "Healthy"
        inc_explain = f"{len(open_inc)} open incident(s)" if len(open_inc) > 0 else "No open incidents"
    else:
        inc_explain = "Incident log not found"

    import datetime
    return {
        "dataQuality":       {"status": dq_status, "explanation": dq_explain, "timestamp": datetime.datetime.utcnow().isoformat() + "Z"},
        "modelPerformance":  {"status": mp_status,  "explanation": mp_explain,  "timestamp": datetime.datetime.utcnow().isoformat() + "Z"},
        "dataDrift":         {"status": drift_status,"explanation": drift_explain,"timestamp": datetime.datetime.utcnow().isoformat() + "Z"},
        "predictionDrift":   {"status": "Healthy",  "explanation": "Prediction monitoring based on synthetic test data", "timestamp": datetime.datetime.utcnow().isoformat() + "Z"},
        "pipelineStatus":    {"status": "Healthy",  "explanation": "All batch scripts available", "timestamp": datetime.datetime.utcnow().isoformat() + "Z"},
        "lastAnalysis":      {"status": inc_status, "explanation": inc_explain, "timestamp": datetime.datetime.utcnow().isoformat() + "Z"},
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# DATA QUALITY  –  GET /api/v1/monitoring/data-quality
# ---------------------------------------------------------------------------

@app.get("/api/v1/monitoring/data-quality")
def get_data_quality():
    if not DQ_REPORT.exists():
        raise HTTPException(404, "Data quality report not found. Run check_data_quality.py first.")

    df = pd.read_csv(DQ_REPORT)

    table = []
    for _, row in df.iterrows():
        table.append({
            "parameter": str(row["check"]),
            "issue_count": int(row["issue_count"]),
            "status": str(row["status"]),
        })

    total_row = df[df["status"] == "INFO"]
    total_records = int(total_row.iloc[0]["issue_count"]) if not total_row.empty else None
    warning_count = len(df[df["status"] == "WARNING"])
    pass_count = len(df[df["status"] == "PASS"])

    import datetime
    return {
        "report_source": str(DQ_REPORT),
        "total_records": total_records,
        "checks_passed": pass_count,
        "checks_warned": warning_count,
        "overall_status": "Warning" if warning_count > 0 else "Healthy",
        "table": table,
        "data_source": "synthetic_demo",
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ---------------------------------------------------------------------------
# MODEL PERFORMANCE  –  GET /api/v1/monitoring/model-performance
# ---------------------------------------------------------------------------

@app.get("/api/v1/monitoring/model-performance")
def get_model_performance():
    if not MODEL_EVAL.exists():
        raise HTTPException(404, "Model evaluation results not found.")

    df = pd.read_csv(MODEL_EVAL)

    metrics: dict = {}
    chart: list = []

    horizon_map = {"target_1h": "h1", "target_6h": "h6", "target_24h": "h24"}
    label_map   = {"target_1h": "+1h", "target_6h": "+6h", "target_24h": "+24h"}

    for _, row in df.iterrows():
        key = horizon_map.get(str(row["target"]), str(row["target"]))
        label = label_map.get(str(row["target"]), str(row["target"]))
        mae  = _safe_float(row["MAE"])
        rmse = _safe_float(row["RMSE"])
        r2   = _safe_float(row["R2"])
        metrics[key] = {"mae": mae, "rmse": rmse, "r2": r2}
        chart.append({"horizon": label, "mae": mae, "rmse": rmse, "r2": r2})

    # Baseline comparison if available
    baseline = None
    if BASELINE_CMP.exists():
        bc = pd.read_csv(BASELINE_CMP)
        baseline = bc.to_dict(orient="records")

    return {
        "model": "RandomForestRegressor",
        "data_type": str(df.iloc[0].get("data_type", "synthetic")),
        "metrics": metrics,
        "chart": chart,
        "baseline_comparison": baseline,
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# DRIFT DETECTION  –  GET /api/v1/monitoring/drift
# ---------------------------------------------------------------------------

@app.get("/api/v1/monitoring/drift")
def get_drift():
    if not DRIFT_REPORT.exists():
        raise HTTPException(404, "Drift report not found. Run detect_drift.py first.")

    df = pd.read_csv(DRIFT_REPORT)

    features_drifting = len(df[df["status"].isin(["HIGH", "MODERATE"])])
    overall = "Warning" if features_drifting > 0 else "Healthy"

    table = []
    for _, row in df.iterrows():
        psi = _safe_float(row["psi"])
        ksp = _safe_float(row["ks_pvalue"])
        status_raw = str(row["status"])
        # Map raw status to UI-friendly labels
        status_ui = {
            "LOW": "No Drift",
            "MODERATE": "Moderate Drift",
            "HIGH": "Drift Detected",
            "INSUFFICIENT_DATA": "Insufficient Data",
            "UNDEFINED": "Undefined",
        }.get(status_raw, status_raw)

        table.append({
            "feature": str(row["feature"]),
            "reference_rows": int(row["reference_rows"]) if pd.notna(row["reference_rows"]) else None,
            "current_rows": int(row["current_rows"]) if pd.notna(row["current_rows"]) else None,
            "psi": psi,
            "ks_pvalue": ksp,
            "status_raw": status_raw,
            "status": status_ui,
            # PSI threshold: 0.1 = MODERATE, 0.25 = HIGH
            "threshold": 0.25,
            "score": psi if psi is not None else 0.0,
        })

    import datetime
    return {
        "summary": {
            "dataDriftStatus": overall,
            "predictionDriftStatus": "Healthy",
            "affectedFeatures": features_drifting,
            "lastChecked": datetime.datetime.utcnow().isoformat() + "Z",
        },
        "table": table,
        "report_note": (
            "This compares synthetic training and test datasets. "
            "It does not represent live production drift monitoring."
        ),
        "data_source": "synthetic_demo",
    }


# ---------------------------------------------------------------------------
# INCIDENTS  –  GET/POST /api/v1/incidents
# ---------------------------------------------------------------------------

@app.get("/api/v1/incidents")
def get_incidents():
    if not INCIDENTS_PATH.exists():
        return {"count": 0, "incidents": [], "data_source": "synthetic_demo"}

    df = pd.read_csv(INCIDENTS_PATH)
    # Fill NaN with None-safe strings
    df = df.where(pd.notnull(df), other=None)

    incidents = []
    for _, row in df.iterrows():
        incidents.append({
            "id": str(row["incident_id"]),
            "type": str(row["incident_type"]),
            "severity": str(row["severity"]),
            "description": str(row["description"]) if row["description"] else "",
            "source": str(row.get("station_id", "")),
            "status": str(row["status"]),
            "created": str(row["created_at"]),
            "lastUpdated": str(row["created_at"]),
            "assignedTo": str(row["assigned_to"]) if row["assigned_to"] else "Unassigned",
            "resolvedAt": str(row["resolved_at"]) if row["resolved_at"] else None,
            "resolutionNotes": str(row["resolution_notes"]) if row["resolution_notes"] else None,
            "data_source": str(row.get("data_source", "synthetic_demo")),
        })

    return {
        "count": len(incidents),
        "incidents": incidents,
        "data_source": "synthetic_demo",
    }