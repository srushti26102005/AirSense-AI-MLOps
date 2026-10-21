from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

# Project directories
BASE_DIR = Path("AirSense_AI_Dataset")
ML_DIR = BASE_DIR / "ml"
RESULTS_DIR = BASE_DIR / "monitoring"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Load reference and comparison datasets
reference_df = pd.read_csv(ML_DIR / "train_dataset.csv")
current_df = pd.read_csv(ML_DIR / "test_dataset.csv")

# Features to monitor
FEATURES = [
    "PM2.5",
    "PM10",
    "NO2",
    "temperature_2m_c",
    "relative_humidity_2m_pct",
    "wind_speed_10m_ms",
]


def calculate_psi(reference, current, bins=10):
    """Calculate the Population Stability Index."""

    reference = np.asarray(reference, dtype=float)
    current = np.asarray(current, dtype=float)

    reference = reference[np.isfinite(reference)]
    current = current[np.isfinite(current)]

    if len(reference) < 30 or len(current) < 30:
        return np.nan

    edges = np.unique(
        np.quantile(reference, np.linspace(0, 1, bins + 1))
    )

    if len(edges) < 2:
        return np.nan

    edges[0] = -np.inf
    edges[-1] = np.inf

    reference_counts = np.histogram(reference, bins=edges)[0]
    current_counts = np.histogram(current, bins=edges)[0]

    reference_pct = (
        reference_counts + 0.5
    ) / (reference_counts.sum() + 0.5 * len(reference_counts))

    current_pct = (
        current_counts + 0.5
    ) / (current_counts.sum() + 0.5 * len(current_counts))

    return float(
        np.sum(
            (current_pct - reference_pct)
            * np.log(current_pct / reference_pct)
        )
    )


def detect_drift(reference_df, current_df, features):
    """Compare feature distributions between two datasets."""

    results = []

    for feature in features:
        reference = pd.to_numeric(
            reference_df[feature], errors="coerce"
        ).dropna()

        current = pd.to_numeric(
            current_df[feature], errors="coerce"
        ).dropna()

        reference = reference[np.isfinite(reference)]
        current = current[np.isfinite(current)]

        if len(reference) < 30 or len(current) < 30:
            results.append({
                "feature": feature,
                "reference_rows": len(reference),
                "current_rows": len(current),
                "psi": np.nan,
                "ks_pvalue": np.nan,
                "status": "INSUFFICIENT_DATA",
            })
            continue

        psi = calculate_psi(reference, current)
        ks_result = ks_2samp(reference, current)

        if np.isnan(psi):
            status = "UNDEFINED"
        elif psi < 0.10:
            status = "LOW"
        elif psi < 0.25:
            status = "MODERATE"
        else:
            status = "HIGH"

        results.append({
            "feature": feature,
            "reference_rows": len(reference),
            "current_rows": len(current),
            "psi": psi,
            "ks_pvalue": ks_result.pvalue,
            "status": status,
        })

    return pd.DataFrame(results)


report = detect_drift(reference_df, current_df, FEATURES)

output_file = RESULTS_DIR / "calculated_drift_report.csv"
report.to_csv(output_file, index=False)

print("\n========== AIRSENSE AI DRIFT REPORT ==========")
print(report.round(4).to_string(index=False))

print("\nReport saved to:", output_file)

print(
    "\nNOTE: This compares synthetic training and test data. "
    "It does not demonstrate live production drift."
)