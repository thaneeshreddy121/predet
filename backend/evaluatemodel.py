import os
import time
import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    top_k_accuracy_score,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "Testing.csv")
MODELS_DIR = os.path.join(BASE_DIR, "ml_models")

BATCH_SIZE = 256

print("=" * 70)
print("DISEASE MODEL BATCH EVALUATION")
print("=" * 70)

print("\nLoading testing data...")
df = pd.read_csv(DATA_PATH)

feature_names = [c for c in df.columns if c != "prognosis"]

X = df[feature_names].astype(np.uint8)
y_text = df["prognosis"].astype(str)

print(f"Testing rows : {len(df)}")
print(f"Symptoms     : {len(feature_names)}")
print(f"Diseases     : {y_text.nunique()}")

print("\nLoading models...")

rf = joblib.load(os.path.join(MODELS_DIR, "rf_model.pkl"))
nb = joblib.load(os.path.join(MODELS_DIR, "nb_model.pkl"))
xgb = joblib.load(os.path.join(MODELS_DIR, "xgb_model.pkl"))
encoder = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))

y = encoder.transform(y_text)

print("Models loaded successfully.")
print("\nEvaluating in batches...")

rf_results = []
nb_results = []
xgb_results = []
ensemble_results = []

start = time.time()

for start_i in range(0, len(X), BATCH_SIZE):

    end_i = min(start_i + BATCH_SIZE, len(X))

    print(
        f"Batch {start_i + 1}-{end_i} / {len(X)}",
        end="\r"
    )

    batch = X.iloc[start_i:end_i]

    rf_prob = rf.predict_proba(batch)
    nb_prob = nb.predict_proba(batch)
    xgb_prob = xgb.predict_proba(batch)

    ensemble_prob = (
        0.35 * rf_prob +
        0.15 * nb_prob +
        0.50 * xgb_prob
    )

    rf_results.append(rf_prob)
    nb_results.append(nb_prob)
    xgb_results.append(xgb_prob)
    ensemble_results.append(ensemble_prob)

print("\nPrediction complete.")
print(f"Evaluation time: {time.time() - start:.1f} seconds")

rf_prob = np.vstack(rf_results)
nb_prob = np.vstack(nb_results)
xgb_prob = np.vstack(xgb_results)
ensemble_prob = np.vstack(ensemble_results)


def evaluate_model(name, probabilities):

    predictions = np.argmax(probabilities, axis=1)

    accuracy = accuracy_score(y, predictions)

    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            y,
            predictions,
            average="weighted",
            zero_division=0
        )
    )

    top3 = top_k_accuracy_score(
        y,
        probabilities,
        k=3,
        labels=np.arange(len(encoder.classes_))
    )

    return {
        "Model": name,
        "Accuracy": accuracy * 100,
        "Precision": precision * 100,
        "Recall": recall * 100,
        "F1": f1 * 100,
        "Top-3 Accuracy": top3 * 100,
    }


results = pd.DataFrame([
    evaluate_model("Random Forest", rf_prob),
    evaluate_model("Naive Bayes", nb_prob),
    evaluate_model("XGBoost", xgb_prob),
    evaluate_model("Weighted Ensemble", ensemble_prob),
])


print("\n")
print("=" * 70)
print("OVERALL RESULTS")
print("=" * 70)

print(
    results.to_string(
        index=False,
        formatters={
            "Accuracy": "{:.2f}%".format,
            "Precision": "{:.2f}%".format,
            "Recall": "{:.2f}%".format,
            "F1": "{:.2f}%".format,
            "Top-3 Accuracy": "{:.2f}%".format,
        }
    )
)


# ------------------------------------------------------------
# Per-disease evaluation
# ------------------------------------------------------------

ensemble_predictions = np.argmax(
    ensemble_prob,
    axis=1
)

precision, recall, f1, support = (
    precision_recall_fscore_support(
        y,
        ensemble_predictions,
        labels=np.arange(len(encoder.classes_)),
        zero_division=0
    )
)

per_disease = pd.DataFrame({
    "Disease": encoder.classes_,
    "Precision": precision * 100,
    "Recall": recall * 100,
    "F1": f1 * 100,
    "Support": support,
})

per_disease = per_disease.sort_values(
    "F1",
    ascending=True
)


print("\n")
print("=" * 70)
print("10 LOWEST-PERFORMING DISEASES")
print("=" * 70)

print(
    per_disease.head(10).to_string(
        index=False,
        formatters={
            "Precision": "{:.2f}%".format,
            "Recall": "{:.2f}%".format,
            "F1": "{:.2f}%".format,
        }
    )
)


summary_path = os.path.join(
    BASE_DIR,
    "model_evaluation_summary.csv"
)

disease_path = os.path.join(
    BASE_DIR,
    "model_evaluation_report.csv"
)

results.to_csv(
    summary_path,
    index=False
)

per_disease.to_csv(
    disease_path,
    index=False
)

print("\n")
print("Files created:")
print(summary_path)
print(disease_path)

print("\nEvaluation finished.")
print("No models were retrained.")