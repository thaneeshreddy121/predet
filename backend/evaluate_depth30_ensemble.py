import os
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "Testing.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml_models"
)

DEPTH30_DIR = os.path.join(
    MODEL_DIR,
    "rf_depth30"
)


# ============================================================
# LOAD TEST DATA
# ============================================================

print("\nLoading testing dataset...")

test_df = pd.read_csv(DATA_PATH)

if "Unnamed: 0" in test_df.columns:
    test_df.drop(columns=["Unnamed: 0"], inplace=True)

if "Unnamed: 133" in test_df.columns:
    test_df.drop(columns=["Unnamed: 133"], inplace=True)

TARGET = "prognosis"

feature_columns = [
    col for col in test_df.columns
    if col != TARGET
]

X_test = test_df[feature_columns].astype(np.int8)
y_test_raw = test_df[TARGET]


# ============================================================
# LOAD LABEL ENCODER
# ============================================================

label_encoder = joblib.load(
    os.path.join(MODEL_DIR, "label_encoder.pkl")
)

y_test = label_encoder.transform(y_test_raw)


# ============================================================
# LOAD MODELS
# ============================================================

print("\nLoading models...")

rf_depth30 = joblib.load(
    os.path.join(
        DEPTH30_DIR,
        "rf_model.pkl"
    )
)

nb_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "nb_model.pkl"
    )
)

xgb_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "xgb_model.pkl"
    )
)

print("All models loaded successfully.")


# ============================================================
# INDIVIDUAL MODEL PREDICTIONS
# ============================================================

print("\nGenerating probabilities...")

rf_prob = rf_depth30.predict_proba(X_test)
nb_prob = nb_model.predict_proba(X_test)
xgb_prob = xgb_model.predict_proba(X_test)


# ============================================================
# INDIVIDUAL ACCURACIES
# ============================================================

rf_pred = np.argmax(rf_prob, axis=1)
nb_pred = np.argmax(nb_prob, axis=1)
xgb_pred = np.argmax(xgb_prob, axis=1)

rf_accuracy = accuracy_score(y_test, rf_pred)
nb_accuracy = accuracy_score(y_test, nb_pred)
xgb_accuracy = accuracy_score(y_test, xgb_pred)


# ============================================================
# WEIGHTED ENSEMBLE
# ============================================================

ensemble_prob = (
    0.35 * rf_prob +
    0.15 * nb_prob +
    0.50 * xgb_prob
)

ensemble_pred = np.argmax(
    ensemble_prob,
    axis=1
)

ensemble_accuracy = accuracy_score(
    y_test,
    ensemble_pred
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 60)
print("DEPTH-30 ENSEMBLE EVALUATION")
print("=" * 60)

print(
    f"Random Forest (Depth 30): "
    f"{rf_accuracy * 100:.2f}%"
)

print(
    f"Gaussian NB             : "
    f"{nb_accuracy * 100:.2f}%"
)

print(
    f"XGBoost                 : "
    f"{xgb_accuracy * 100:.2f}%"
)

print(
    f"Weighted Ensemble       : "
    f"{ensemble_accuracy * 100:.2f}%"
)

print("=" * 60)

print("\nWeights used:")
print("  Random Forest : 35%")
print("  Gaussian NB   : 15%")
print("  XGBoost       : 50%")

print("\nExisting models were NOT modified.")
print("Evaluation complete.")