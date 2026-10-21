import pandas as pd
from pathlib import Path

base_path = Path("AirSense_AI_Dataset")

files = [
    base_path / "ml" / "model_training_dataset.csv",
    base_path / "ml" / "train_dataset.csv",
    base_path / "ml" / "validation_dataset.csv",
    base_path / "ml" / "test_dataset.csv",
]

for file in files:
    print("\n" + "=" * 60)
    print(f"File: {file}")

    if not file.exists():
        print("File not found. Check the folder path.")
        continue

    df = pd.read_csv(file, nrows=5)

    print("Columns:")
    print(df.columns.tolist())

    print("\nSample records:")
    print(df.head(3))


    