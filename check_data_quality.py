from pathlib import Path

import pandas as pd

BASE_DIR = Path("AirSense_AI_Dataset")
ML_DIR = BASE_DIR / "ml"
MONITORING_DIR = BASE_DIR / "monitoring"

MONITORING_DIR.mkdir(parents=True, exist_ok=True)

# Load the test dataset for this demonstration.
# In production, validate newly ingested observations instead.
df = pd.read_csv(ML_DIR / "test_dataset.csv")

required_columns = [
    "timestamp",
    "station_id",
    "PM2.5",
    "PM10",
    "NO2",
    "temperature_2m_c",
    "relative_humidity_2m_pct",
    "wind_speed_10m_ms",
]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Required columns are missing: {missing_columns}"
    )

# Convert measurements to numeric values where possible.
measurement_columns = [
    "PM2.5",
    "PM10",
    "NO2",
    "temperature_2m_c",
    "relative_humidity_2m_pct",
    "wind_speed_10m_ms",
]

for column in measurement_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")

# Check timestamps.
df["timestamp"] = pd.to_datetime(
    df["timestamp"], errors="coerce", utc=True
)

# Calculate quality indicators.
missing_measurements = df[measurement_columns].isna().sum()

duplicate_rows = int(df.duplicated().sum())

missing_timestamps = int(df["timestamp"].isna().sum())

missing_station_ids = int(df["station_id"].isna().sum())

# These checks assume pollutant concentrations are non-negative.
negative_pollutant_counts = {
    column: int((df[column] < 0).sum())
    for column in ["PM2.5", "PM10", "NO2"]
}

# Relative humidity is expected to be between 0 and 100%.
invalid_humidity = int(
    (
        (df["relative_humidity_2m_pct"] < 0)
        | (df["relative_humidity_2m_pct"] > 100)
    ).sum()
)

report = pd.DataFrame([
    {
        "check": "Total rows",
        "issue_count": len(df),
        "status": "INFO",
    },
    {
        "check": "Duplicate rows",
        "issue_count": duplicate_rows,
        "status": "PASS" if duplicate_rows == 0 else "WARNING",
    },
    {
        "check": "Missing timestamps",
        "issue_count": missing_timestamps,
        "status": "PASS" if missing_timestamps == 0 else "WARNING",
    },
    {
        "check": "Missing station IDs",
        "issue_count": missing_station_ids,
        "status": "PASS" if missing_station_ids == 0 else "WARNING",
    },
    {
        "check": "Negative PM2.5 readings",
        "issue_count": negative_pollutant_counts["PM2.5"],
        "status": (
            "PASS"
            if negative_pollutant_counts["PM2.5"] == 0
            else "WARNING"
        ),
    },
    {
        "check": "Negative PM10 readings",
        "issue_count": negative_pollutant_counts["PM10"],
        "status": (
            "PASS"
            if negative_pollutant_counts["PM10"] == 0
            else "WARNING"
        ),
    },
    {
        "check": "Negative NO2 readings",
        "issue_count": negative_pollutant_counts["NO2"],
        "status": (
            "PASS"
            if negative_pollutant_counts["NO2"] == 0
            else "WARNING"
        ),
    },
    {
        "check": "Invalid relative humidity",
        "issue_count": invalid_humidity,
        "status": "PASS" if invalid_humidity == 0 else "WARNING",
    },
])

# Add missing-value checks for every measurement.
for column, count in missing_measurements.items():
    report.loc[len(report)] = {
        "check": f"Missing values: {column}",
        "issue_count": int(count),
        "status": "PASS" if count == 0 else "WARNING",
    }

output_path = MONITORING_DIR / "calculated_data_quality_report.csv"
report.to_csv(output_path, index=False)

print("\n========== AIRSENSE AI DATA QUALITY REPORT ==========")
print(report.to_string(index=False))
print("\nReport saved to:", output_path)

print(
    "\nNOTE: This report checks the synthetic test dataset. "
    "Production monitoring should validate newly ingested data."
)









