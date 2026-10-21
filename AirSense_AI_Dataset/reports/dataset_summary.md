# AirSense AI Dataset Summary

## Important
This is a **synthetic demonstration package**, not real environmental data from CPCB, XKDR, or Open-Meteo. It is suitable for development, API integration, dashboard testing, and testing MLOps workflows. Do not report model accuracy on it as real-world performance.

## Coverage
- Cities: 8
- Stations: 24
- Hourly timestamps per station: 2160
- Raw air-quality rows: 51,840
- Raw weather rows: 51,840
- Merged rows: 51,840
- Supervised rows after lag/rolling/target requirements: 50,112
- Train rows: 35,064
- Validation rows: 7,512
- Test rows: 7,536

## Files
- `raw/air_quality_raw.csv`: synthetic pollutant observations.
- `raw/weather_raw.csv`: synthetic weather observations.
- `raw/live_air_quality_demo.csv`: latest synthetic observations in long format for API testing.
- `raw/live_weather_demo.csv`: latest synthetic weather record per station.
- `processed/station_master.csv`: synthetic station metadata; coordinates are illustrative and unverified.
- `processed/air_quality_weather_master.csv`: joined data plus time, lag, rolling and target columns.
- `ml/model_training_dataset.csv`: supervised ML dataset.
- `ml/train_dataset.csv`, `ml/validation_dataset.csv`, `ml/test_dataset.csv`: chronological per-station splits.
- `monitoring/data_quality_demo.csv`: example quality monitoring schema.
- `monitoring/prediction_monitoring_demo.csv`: illustrative prediction monitoring rows, not actual model output.
- `monitoring/drift_monitoring_demo.csv`: illustrative drift records.
- `monitoring/incidents_demo.csv`: illustrative incidents.
- `reports/dataset_metadata.json`: schema and feature definitions.

## Before final training
Replace synthetic raw data with validated historical XKDR air-quality observations and matching Open-Meteo weather. Validate station metadata, units, missingness, duplicate timestamps, timezones and pollutant availability. Rebuild features and targets after cleaning. The included train/validation/test split is a development starting point, not a substitute for leakage review and final research validation.
