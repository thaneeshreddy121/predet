import os
import time
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_PATH = os.path.join(BASE_DIR, "datasets", "Training.csv")
TEST_PATH = os.path.join(BASE_DIR, "datasets", "Testing.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading datasets...")

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(TEST_PATH)

print(f"Training data: {train_df.shape}")
print(f"Testing data : {test_df.shape}")


# Remove accidental index columns
for df in [train_df, test_df]:
    if "Unnamed: 0" in df.columns:
        df.drop(columns=["Unnamed: 0"], inplace=True)

    if "Unnamed: 133" in df.columns:
        df.drop(columns=["Unnamed: 133"], inplace=True)


# ============================================================
# FEATURES / TARGET
# ============================================================

TARGET = "prognosis"

if TARGET not in train_df.columns:
    raise ValueError("prognosis column not found in Training.csv")

if TARGET not in test_df.columns:
    raise ValueError("prognosis column not found in Testing.csv")


feature_columns = [
    col for col in train_df.columns
    if col != TARGET
]

X_train = train_df[feature_columns].astype(np.int8)
X_test = test_df[feature_columns].astype(np.int8)

y_train_raw = train_df[TARGET]
y_test_raw = test_df[TARGET]

print(f"\nNumber of symptoms : {len(feature_columns)}")
print(f"Number of diseases : {y_train_raw.nunique()}")


# ============================================================
# LABEL ENCODING
# ============================================================

print("\nEncoding disease labels...")

label_encoder = LabelEncoder()

y_train = label_encoder.fit_transform(y_train_raw)
y_test = label_encoder.transform(y_test_raw)

# Keep existing label encoder compatible with the new RF
joblib.dump(
    label_encoder,
    os.path.join(MODEL_DIR, "label_encoder.pkl")
)


# ============================================================
# METADATA
# ============================================================

metadata = {
    "feature_columns": feature_columns,
    "target_column": TARGET,
    "num_features": len(feature_columns),
    "num_classes": len(label_encoder.classes_),
    "classes": list(label_encoder.classes_)
}

joblib.dump(
    metadata,
    os.path.join(MODEL_DIR, "metadata.pkl")
)


# ============================================================
# RANDOM FOREST
# ============================================================

print("\n" + "=" * 60)
print("TRAINING NEW LIGHTWEIGHT RANDOM FOREST")
print("=" * 60)

start = time.time()

rf_model = RandomForestClassifier(
    n_estimators=50,
    max_depth=20,
    min_samples_split=2,
    min_samples_leaf=2,
    max_features="sqrt",
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)

print("\nTraining Random Forest...")

rf_model.fit(X_train, y_train)

print("Training completed.")

# ============================================================
# EVALUATION
# ============================================================

rf_pred = rf_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_pred)

print("\n" + "=" * 60)
print("RESULT")
print("=" * 60)

print(f"Random Forest accuracy: {rf_accuracy * 100:.2f}%")
print(f"Training time: {time.time() - start:.1f} seconds")


# ============================================================
# SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "rf_model.pkl"
)

joblib.dump(
    rf_model,
    model_path,
    compress=3
)

# ============================================================
# MODEL SIZE
# ============================================================

model_size_mb = os.path.getsize(model_path) / (1024 * 1024)

print("\n" + "=" * 60)
print("MODEL SAVED")
print("=" * 60)

print(f"Location : {model_path}")
print(f"Size     : {model_size_mb:.2f} MB")

print("\nRandom Forest retraining complete.")