from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.pipeline import make_pipeline


# Project paths
BASE_DIR = Path("AirSense_AI_Dataset")
ML_DIR = BASE_DIR / "ml"
MODEL_DIR = BASE_DIR / "trained_models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# Load the existing chronological splits
train_df = pd.read_csv(ML_DIR / "train_dataset.csv")
val_df = pd.read_csv(ML_DIR / "validation_dataset.csv")
test_df = pd.read_csv(ML_DIR / "test_dataset.csv")


# Forecasting targets
TARGETS = [
    "target_1h",
    "target_6h",
    "target_24h",
]


# Input features available in your dataset.
# Exclude identifiers, timestamps, and future targets.
EXCLUDED_COLUMNS = [
    "timestamp",
    "station_id",
    "station_name",
    "city",
    "state",
    "data_source",
    "season",
    *TARGETS,
]


FEATURES = [
    column
    for column in train_df.columns
    if column not in EXCLUDED_COLUMNS
    and pd.api.types.is_numeric_dtype(train_df[column])
]


# Keep the same features for all splits
missing_features = [
    feature
    for feature in FEATURES
    if feature not in val_df.columns
    or feature not in test_df.columns
]

if missing_features:
    raise ValueError(
        f"Features missing from a split: {missing_features}"
    )


print("Number of training features:", len(FEATURES))
print("Features:", FEATURES)


results = []


for target in TARGETS:

    print("\n" + "=" * 55)
    print("Training model for:", target)

    for name, df in [
        ("train", train_df),
        ("validation", val_df),
        ("test", test_df),
    ]:
        if target not in df.columns:
            raise ValueError(
                f"{target} missing from {name} dataset"
            )

    # Do not train on missing target values
    train_data = train_df.dropna(subset=[target])

    val_data = val_df.dropna(subset=[target])

    test_data = test_df.dropna(subset=[target])

    if train_data.empty or test_data.empty:
        print("Insufficient data. Skipping:", target)
        continue

    model = make_pipeline(
        SimpleImputer(strategy="median"),
        RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        ),
    )

    # Train only on the training split
    model.fit(
        train_data[FEATURES],
        train_data[target],
    )

    # Validation metrics
    if not val_data.empty:
        val_predictions = model.predict(
            val_data[FEATURES]
        )

        val_mae = mean_absolute_error(
            val_data[target],
            val_predictions,
        )

        print("Validation MAE:", round(val_mae, 3))

    # Final evaluation on the held-out test split
    test_predictions = model.predict(
        test_data[FEATURES]
    )

    mae = mean_absolute_error(
        test_data[target],
        test_predictions,
    )

    rmse = np.sqrt(
        mean_squared_error(
            test_data[target],
            test_predictions,
        )
    )

    r2 = r2_score(
        test_data[target],
        test_predictions,
    )

    print("Test MAE:", round(mae, 3))
    print("Test RMSE:", round(rmse, 3))
    print("Test R2:", round(r2, 3))

    results.append({
        "target": target,
        "model": "RandomForestRegressor",
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2,
        "data_type": "synthetic",
    })

    # Save the model and its exact input feature order
    artifact = {
        "model": model,
        "features": FEATURES,
        "target": target,
        "model_type": "RandomForestRegressor",
        "data_type": "synthetic",
    }

    output_file = MODEL_DIR / f"{target}_model.joblib"

    joblib.dump(artifact, output_file)

    print("Saved:", output_file)


# Save evaluation results
results_df = pd.DataFrame(results)

results_file = BASE_DIR / "model_evaluation_results.csv"

results_df.to_csv(results_file, index=False)

print("\n" + "=" * 55)
print("MODEL TRAINING COMPLETED")
print(results_df)
print("\nResults saved to:", results_file)