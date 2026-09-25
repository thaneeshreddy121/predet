import os
import joblib
import numpy as np
import pandas as pd

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt

from sklearn.metrics import (
    confusion_matrix,
    precision_recall_fscore_support
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_PATH = os.path.join(BASE_DIR, "datasets", "Training.csv")
TEST_PATH = os.path.join(BASE_DIR, "datasets", "Testing.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")
PLOTS_DIR = os.path.join(BASE_DIR, "plots")

os.makedirs(PLOTS_DIR, exist_ok=True)


print("=" * 70)
print("CURRENT DATASET PLOT GENERATION")
print("=" * 70)


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading datasets...")

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(TEST_PATH)

print(f"Training rows : {len(train_df)}")
print(f"Testing rows  : {len(test_df)}")


TARGET = "prognosis"

feature_columns = [
    column for column in train_df.columns
    if column != TARGET
]

print(f"Symptoms      : {len(feature_columns)}")
print(f"Diseases      : {train_df[TARGET].nunique()}")


# ============================================================
# LOAD CURRENT MODELS
# ============================================================

print("\nLoading current trained models...")

rf_model = joblib.load(
    os.path.join(MODEL_DIR, "rf_model.pkl")
)

nb_model = joblib.load(
    os.path.join(MODEL_DIR, "nb_model.pkl")
)

xgb_model = joblib.load(
    os.path.join(MODEL_DIR, "xgb_model.pkl")
)

label_encoder = joblib.load(
    os.path.join(MODEL_DIR, "label_encoder.pkl")
)

print("Models loaded successfully.")


# ============================================================
# PREPARE TEST DATA
# ============================================================

X_test = test_df[feature_columns].astype(np.uint8)

y_test_text = test_df[TARGET].astype(str)

y_test = label_encoder.transform(y_test_text)

classes = label_encoder.classes_

print(f"Test samples  : {len(X_test)}")
print(f"Classes        : {len(classes)}")


# ============================================================
# 1. CLASS DISTRIBUTION
# ============================================================

print("\n[1/4] Generating class distribution...")

class_counts = train_df[TARGET].value_counts().sort_values(
    ascending=False
)

plt.figure(figsize=(18, 10))

class_counts.plot(
    kind="bar"
)

plt.title(
    "Disease Class Distribution - Current Training Dataset",
    fontsize=16
)

plt.xlabel("Disease")
plt.ylabel("Number of Samples")

plt.xticks(
    rotation=90,
    fontsize=7
)

plt.tight_layout()

class_distribution_path = os.path.join(
    PLOTS_DIR,
    "class_distribution.png"
)

plt.savefig(
    class_distribution_path,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(f"Saved: {class_distribution_path}")


# ============================================================
# 2. FEATURE IMPORTANCE
# ============================================================

print("\n[2/4] Generating feature importance...")

feature_importance = pd.DataFrame({
    "symptom": feature_columns,
    "importance": rf_model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)

# Save complete feature importance CSV
feature_importance_csv = os.path.join(
    PLOTS_DIR,
    "feature_importance_current.csv"
)

feature_importance.to_csv(
    feature_importance_csv,
    index=False
)

# Show top 30 symptoms in the plot
top_features = feature_importance.head(30)

plt.figure(figsize=(12, 10))

plt.barh(
    top_features["symptom"][::-1],
    top_features["importance"][::-1]
)

plt.title(
    "Top 30 Feature Importances - Random Forest",
    fontsize=16
)

plt.xlabel("Importance")
plt.ylabel("Symptom")

plt.tight_layout()

feature_importance_path = os.path.join(
    PLOTS_DIR,
    "feature_importances.png"
)

plt.savefig(
    feature_importance_path,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(f"Saved: {feature_importance_path}")
print(f"Saved: {feature_importance_csv}")


# ============================================================
# 3. MODEL PREDICTIONS + WEIGHTED ENSEMBLE
# ============================================================

print("\nGenerating model predictions...")

rf_prob = rf_model.predict_proba(X_test)
nb_prob = nb_model.predict_proba(X_test)
xgb_prob = xgb_model.predict_proba(X_test)


# Same weights used in evaluatemodel.py
ensemble_prob = (
    0.35 * rf_prob +
    0.15 * nb_prob +
    0.50 * xgb_prob
)

ensemble_predictions = np.argmax(
    ensemble_prob,
    axis=1
)


# ============================================================
# 3. CONFUSION MATRIX
# ============================================================

print("\n[3/4] Generating confusion matrix...")

cm = confusion_matrix(
    y_test,
    ensemble_predictions,
    labels=np.arange(len(classes))
)

plt.figure(figsize=(24, 22))

plt.imshow(
    cm,
    interpolation="nearest"
)

plt.title(
    "Confusion Matrix - Weighted Ensemble",
    fontsize=18
)

plt.xlabel("Predicted Disease")
plt.ylabel("Actual Disease")

plt.xticks(
    np.arange(len(classes)),
    classes,
    rotation=90,
    fontsize=4
)

plt.yticks(
    np.arange(len(classes)),
    classes,
    fontsize=4
)

plt.colorbar(
    label="Number of Samples"
)

plt.tight_layout()

confusion_matrix_path = os.path.join(
    PLOTS_DIR,
    "confusion_matrix.png"
)

plt.savefig(
    confusion_matrix_path,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(f"Saved: {confusion_matrix_path}")


# ============================================================
# 4. PER-CLASS METRICS
# ============================================================

print("\n[4/4] Generating per-class metrics...")

precision, recall, f1, support = (
    precision_recall_fscore_support(
        y_test,
        ensemble_predictions,
        labels=np.arange(len(classes)),
        zero_division=0
    )
)

per_class_metrics = pd.DataFrame({
    "Disease": classes,
    "Precision": precision * 100,
    "Recall": recall * 100,
    "F1": f1 * 100,
    "Support": support
})

per_class_metrics = per_class_metrics.sort_values(
    by="F1",
    ascending=True
)


# Save CSV
per_class_metrics_path = os.path.join(
    PLOTS_DIR,
    "per_class_metrics.csv"
)

per_class_metrics.to_csv(
    per_class_metrics_path,
    index=False
)

print(f"Saved: {per_class_metrics_path}")


# ============================================================
# PER-CLASS METRICS PLOT
# ============================================================

# Plot the 20 lowest-performing diseases
lowest_20 = per_class_metrics.head(20)

y_positions = np.arange(len(lowest_20))

plt.figure(figsize=(12, 10))

plt.barh(
    y_positions,
    lowest_20["F1"]
)

plt.yticks(
    y_positions,
    lowest_20["Disease"],
    fontsize=8
)

plt.xlabel("F1 Score (%)")

plt.ylabel("Disease")

plt.title(
    "20 Lowest-Performing Diseases - Weighted Ensemble",
    fontsize=16
)

plt.xlim(0, 100)

plt.tight_layout()

per_class_plot_path = os.path.join(
    PLOTS_DIR,
    "per_class_metrics.png"
)

plt.savefig(
    per_class_plot_path,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(f"Saved: {per_class_plot_path}")


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("PLOT GENERATION COMPLETED")
print("=" * 70)

print("\nCurrent files generated:")

print("  plots/class_distribution.png")
print("  plots/confusion_matrix.png")
print("  plots/feature_importances.png")
print("  plots/per_class_metrics.png")
print("  plots/per_class_metrics.csv")
print("  plots/feature_importance_current.csv")

print("\nAll plots are based on the current Training.csv,")
print("Testing.csv and current trained models.")