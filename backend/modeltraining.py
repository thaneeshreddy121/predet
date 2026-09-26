import os
import time
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_PATH = os.path.join(BASE_DIR, "datasets", "Training.csv")
TEST_PATH = os.path.join(BASE_DIR, "datasets", "Testing.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")

FRONTEND_SYMPTOMS = os.path.join(
    BASE_DIR,
    "..",
    "frontend",
    "public",
    "symptoms.txt"
)


# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# START
# ============================================================

print("\n" + "=" * 60)
print("MEDS AI - MODEL TRAINING")
print("=" * 60)

start_time = time.time()


# ============================================================
# LOAD DATASET
# ============================================================

print("\n[1/6] Loading datasets...")

if not os.path.exists(TRAIN_PATH):
    raise FileNotFoundError(
        f"Training dataset not found:\n{TRAIN_PATH}"
    )

if not os.path.exists(TEST_PATH):
    raise FileNotFoundError(
        f"Testing dataset not found:\n{TEST_PATH}"
    )

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(TEST_PATH)

print(f"Training data : {train_df.shape}")
print(f"Testing data  : {test_df.shape}")


# ============================================================
# TARGET AND FEATURES
# ============================================================

TARGET = "prognosis"

if TARGET not in train_df.columns:
    raise ValueError(
        f"Target column '{TARGET}' was not found in Training.csv"
    )

if TARGET not in test_df.columns:
    raise ValueError(
        f"Target column '{TARGET}' was not found in Testing.csv"
    )


feature_columns = [
    column for column in train_df.columns
    if column != TARGET
]


# Make sure train and test contain the same features
missing_in_test = [
    column for column in feature_columns
    if column not in test_df.columns
]

if missing_in_test:
    raise ValueError(
        "Testing.csv is missing these features:\n"
        + "\n".join(missing_in_test)
    )


print(f"Number of symptoms : {len(feature_columns)}")
print(
    f"Number of diseases : "
    f"{train_df[TARGET].nunique()}"
)


# ============================================================
# PREPARE FEATURES
# ============================================================

print("\n[2/6] Preparing features...")

X_train = train_df[feature_columns].astype(np.int8)
X_test = test_df[feature_columns].astype(np.int8)

y_train_raw = train_df[TARGET].astype(str)
y_test_raw = test_df[TARGET].astype(str)


# ============================================================
# LABEL ENCODING
# ============================================================

label_encoder = LabelEncoder()

y_train = label_encoder.fit_transform(y_train_raw)
y_test = label_encoder.transform(y_test_raw)

print(f"Classes : {len(label_encoder.classes_)}")


# Save label encoder
joblib.dump(
    label_encoder,
    os.path.join(MODEL_DIR, "label_encoder.pkl"),
    compress=3
)


# ============================================================
# SAVE METADATA
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
    os.path.join(MODEL_DIR, "metadata.pkl"),
    compress=3
)

print("Metadata saved.")


# ============================================================
# SAVE SYMPTOM LIST FOR FRONTEND
# ============================================================

try:
    os.makedirs(
        os.path.dirname(FRONTEND_SYMPTOMS),
        exist_ok=True
    )

    with open(
        FRONTEND_SYMPTOMS,
        "w",
        encoding="utf-8"
    ) as file:

        for symptom in feature_columns:
            file.write(symptom + "\n")

    print("Frontend symptoms.txt updated.")

except Exception as e:
    print(f"Warning: Could not update symptoms.txt: {e}")


# ============================================================
# RANDOM FOREST
# ============================================================

print("\n[3/6] Training Random Forest...")
print("-" * 60)

rf_start = time.time()

rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features="sqrt",
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)

rf_model.fit(X_train, y_train)

rf_pred = rf_model.predict(X_test)

rf_accuracy = accuracy_score(
    y_test,
    rf_pred
)

rf_time = time.time() - rf_start

print(f"Random Forest accuracy : {rf_accuracy * 100:.2f}%")
print(f"Training time          : {rf_time:.2f} seconds")


# Save Random Forest with compression
rf_path = os.path.join(
    MODEL_DIR,
    "rf_model.pkl"
)

joblib.dump(
    rf_model,
    rf_path,
    compress=("lzma", 9)
)

print("Random Forest saved.")


# ============================================================
# NAIVE BAYES
# ============================================================

print("\n[4/6] Training Naive Bayes...")
print("-" * 60)

nb_start = time.time()

nb_model = GaussianNB()

nb_model.fit(
    X_train,
    y_train
)

nb_pred = nb_model.predict(X_test)

nb_accuracy = accuracy_score(
    y_test,
    nb_pred
)

nb_time = time.time() - nb_start

print(f"Naive Bayes accuracy : {nb_accuracy * 100:.2f}%")
print(f"Training time        : {nb_time:.2f} seconds")


# Save Naive Bayes
nb_path = os.path.join(
    MODEL_DIR,
    "nb_model.pkl"
)

joblib.dump(
    nb_model,
    nb_path,
    compress=3
)

print("Naive Bayes saved.")


# ============================================================
# XGBOOST
# ============================================================

print("\n[5/6] Training XGBoost...")
print("-" * 60)

xgb_start = time.time()

xgb_model = XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    tree_method="hist",
    subsample=0.8,
    colsample_bytree=0.8,
    objective="multi:softprob",
    eval_metric="mlogloss",
    n_jobs=-1,
    random_state=42,
    verbosity=0
)

xgb_model.fit(
    X_train,
    y_train
)

xgb_pred = xgb_model.predict(X_test)

xgb_accuracy = accuracy_score(
    y_test,
    xgb_pred
)

xgb_time = time.time() - xgb_start

print(f"XGBoost accuracy : {xgb_accuracy * 100:.2f}%")
print(f"Training time    : {xgb_time:.2f} seconds")


# Save XGBoost
xgb_path = os.path.join(
    MODEL_DIR,
    "xgb_model.pkl"
)

joblib.dump(
    xgb_model,
    xgb_path,
    compress=3
)

print("XGBoost saved.")


# ============================================================
# RANDOM FOREST FEATURE IMPORTANCE
# ============================================================

print("\n[6/6] Saving feature importance...")

feature_importance = pd.DataFrame({
    "symptom": feature_columns,
    "importance": rf_model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)

feature_importance_path = os.path.join(
    MODEL_DIR,
    "feature_importance.csv"
)

feature_importance.to_csv(
    feature_importance_path,
    index=False
)

print("Feature importance saved.")


# ============================================================
# FINAL RESULTS
# ============================================================

total_time = time.time() - start_time

print("\n" + "=" * 60)
print("TRAINING COMPLETED")
print("=" * 60)

print("\nMODEL ACCURACY")
print("-" * 60)

print(
    f"Random Forest : {rf_accuracy * 100:.2f}%"
)

print(
    f"Naive Bayes   : {nb_accuracy * 100:.2f}%"
)

print(
    f"XGBoost       : {xgb_accuracy * 100:.2f}%"
)

print("-" * 60)

print(f"Total training time : {total_time:.2f} seconds")


# ============================================================
# MODEL FILE SIZES
# ============================================================

print("\nMODEL FILE SIZES")
print("-" * 60)

model_files = [
    "rf_model.pkl",
    "nb_model.pkl",
    "xgb_model.pkl",
    "label_encoder.pkl",
    "metadata.pkl"
]

for filename in model_files:

    path = os.path.join(
        MODEL_DIR,
        filename
    )

    if os.path.exists(path):

        size_mb = os.path.getsize(path) / (
            1024 * 1024
        )

        print(
            f"{filename:<22} {size_mb:.2f} MB"
        )


print("\n" + "=" * 60)
print("Required model files are ready.")
print("=" * 60)

print("\nFiles created:")
print("  rf_model.pkl")
print("  nb_model.pkl")
print("  xgb_model.pkl")
print("  label_encoder.pkl")
print("  metadata.pkl")
print("  feature_importance.csv")
print("  frontend/public/symptoms.txt")

print("\nYou can now start the backend and test predictions.")