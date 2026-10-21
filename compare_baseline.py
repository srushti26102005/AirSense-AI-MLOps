from pathlib import Path

import numpy as np
import pandas as pd
import joblib

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

BASE_DIR = Path("AirSense_AI_Dataset")

test_df = pd.read_csv(
    BASE_DIR / "ml" / "test_dataset.csv"
)

MODEL_DIR = BASE_DIR / "trained_models"

results = []

# Each row's current PM2.5 is used as the baseline
# for all three forecasting horizons.
baseline_prediction = test_df["PM2.5"]

for target in ["target_1h", "target_6h", "target_24h"]:

    valid = (
        test_df[target].notna()
        & baseline_prediction.notna()
        & np.isfinite(test_df[target])
        & np.isfinite(baseline_prediction)
    )

    y_true = test_df.loc[valid, target]
    baseline_pred = baseline_prediction.loc[valid]

    baseline_mae = mean_absolute_error(
        y_true,
        baseline_pred
    )

    baseline_rmse = np.sqrt(
        mean_squared_error(
            y_true,
            baseline_pred
        )
    )

    baseline_r2 = r2_score(
        y_true,
        baseline_pred
    )

    artifact = joblib.load(
        MODEL_DIR / f"{target}_model.joblib"
    )

    features = artifact["features"]
    model = artifact["model"]

    # Use exactly the same test rows for both methods.
    X_test = test_df.loc[valid, features]

    rf_predictions = model.predict(X_test)

    rf_mae = mean_absolute_error(
        y_true,
        rf_predictions
    )

    rf_rmse = np.sqrt(
        mean_squared_error(
            y_true,
            rf_predictions
        )
    )

    rf_r2 = r2_score(
        y_true,
        rf_predictions
    )

    results.append({
        "forecast_horizon": target,
        "baseline_MAE": baseline_mae,
        "random_forest_MAE": rf_mae,
        "baseline_RMSE": baseline_rmse,
        "random_forest_RMSE": rf_rmse,
        "baseline_R2": baseline_r2,
        "random_forest_R2": rf_r2,
        "MAE_improvement": baseline_mae - rf_mae,
    })

results_df = pd.DataFrame(results)

output_file = BASE_DIR / "baseline_comparison.csv"

results_df.to_csv(output_file, index=False)

print("\nBASELINE VS RANDOM FOREST")
print(results_df.round(3).to_string(index=False))

print("\nSaved results to:", output_file)