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

# Separate experimental model directory.
# Existing RF models remain untouched.
MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml_models",
    "rf_depth30"
)

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
print("TRAINING RANDOM FOREST — DEPTH 30")
print("=" * 60)

start = time.time()

rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=30,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features="sqrt",
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)

print("\nRandom Forest configuration:")
print(f"  n_estimators     : {rf_model.n_estimators}")
print(f"  max_depth        : {rf_model.max_depth}")
print(f"  min_samples_split: {rf_model.min_samples_split}")
print(f"  min_samples_leaf : {rf_model.min_samples_leaf}")
print(f"  max_features     : {rf_model.max_features}")
print(f"  class_weight     : {rf_model.class_weight}")

print("\nTraining Random Forest...")

rf_model.fit(X_train, y_train)

print("Training completed.")


# ============================================================
# EVALUATION
# ============================================================

print("\nEvaluating Random Forest...")

rf_pred = rf_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_pred)

print("\n" + "=" * 60)
print("RESULT")
print("=" * 60)

print(f"Random Forest accuracy: {rf_accuracy * 100:.2f}%")
print(f"Training time: {time.time() - start:.1f} seconds")


# ============================================================
# MODEL STRUCTURE
# ============================================================

total_nodes = sum(
    tree.tree_.node_count
    for tree in rf_model.estimators_
)

average_nodes = total_nodes / len(rf_model.estimators_)

maximum_depth = max(
    tree.tree_.max_depth
    for tree in rf_model.estimators_
)

print("\nModel structure:")
print(f"  Trees              : {len(rf_model.estimators_)}")
print(f"  Total nodes        : {total_nodes}")
print(f"  Average nodes/tree : {average_nodes:.1f}")
print(f"  Maximum tree depth : {maximum_depth}")


# ============================================================
# SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "rf_model.pkl"
)

print("\nSaving model...")

joblib.dump(
    rf_model,
    model_path,
    compress=3
)


# ============================================================
# MODEL SIZE
# ============================================================

model_size_mb = os.path.getsize(model_path) / (1024 * 1024)


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n" + "=" * 60)
print("DEPTH-30 RANDOM FOREST SAVED")
print("=" * 60)

print(f"Location : {model_path}")
print(f"Size     : {model_size_mb:.2f} MB")
print(f"Accuracy : {rf_accuracy * 100:.2f}%")

print("\nExisting RF models were NOT modified.")
print("Training complete.")