"""
Disease predictor compatible with the current prediction_routes.py.

Accepts either:
    predict_disease({"symptoms": ["Itching Of Skin", "Skin Rash"]})
or:
    predict_disease(["Itching Of Skin", "Skin Rash"])

Uses the trained RF, NB and XGBoost models only.
"""

import os
import re
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(BASE_DIR, "ml_models")
DATA_PATH = os.path.join(BASE_DIR, "datasets", "Training.csv")

print("[Predictor] Loading trained models...")

#rf_model = joblib.load(os.path.join(MODELS_DIR, "rf_model.pkl"))
rf_model = joblib.load(
    os.path.join(MODELS_DIR, "rf_depth30", "rf_model.pkl")
)
nb_model = joblib.load(os.path.join(MODELS_DIR, "nb_model.pkl"))
xgb_model = joblib.load(os.path.join(MODELS_DIR, "xgb_model.pkl"))
label_encoder = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))
metadata = joblib.load(os.path.join(MODELS_DIR, "metadata.pkl"))

feature_names = list(metadata["feature_columns"])
prediction_classes = np.asarray(label_encoder.classes_)

print(f"[Predictor] Number of symptoms: {len(feature_names)}")
print(f"[Predictor] Number of diseases: {len(prediction_classes)}")

# Fast lookup: normalized name -> actual model column name
def normalize_name(value):
    value = str(value).strip().lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return re.sub(r"_+", "_", value).strip("_")

feature_lookup = {normalize_name(x): x for x in feature_names}

# A few common UI/display-name variations.
ALIASES = {
    "itchy_skin": "itching_of_skin",
    "skin_itching": "itching_of_skin",
    "rash": "skin_rash",
}

for alias, target in ALIASES.items():
    target_col = feature_lookup.get(normalize_name(target))
    if target_col:
        feature_lookup[normalize_name(alias)] = target_col


def normalize_symptoms(symptoms):
    """
    Convert frontend display names such as 'Itching Of Skin'
    into the exact snake_case feature names used by the trained models.
    """
    if symptoms is None:
        return [], []

    if isinstance(symptoms, str):
        symptoms = [symptoms]

    matched = []
    unmatched = []
    seen = set()

    for item in symptoms:
        key = normalize_name(item)
        column = feature_lookup.get(key)

        if column is None:
            unmatched.append(str(item))
            continue

        if column not in seen:
            matched.append(column)
            seen.add(column)

    return matched, unmatched


def _make_input(symptoms):
    x = np.zeros((1, len(feature_names)), dtype=np.uint8)
    index = {name: i for i, name in enumerate(feature_names)}

    for symptom in symptoms:
        if symptom in index:
            x[0, index[symptom]] = 1

    return x


def _get_probabilities(x):
    rf_prob = rf_model.predict_proba(x)[0]
    nb_prob = nb_model.predict_proba(x)[0]
    xgb_prob = xgb_model.predict_proba(x)[0]

    # Same ensemble used during the updated predictor design.
    ensemble_prob = (
        0.35 * rf_prob +
        0.15 * nb_prob +
        0.50 * xgb_prob
    )

    return rf_prob, nb_prob, xgb_prob, ensemble_prob


def _training_evidence(x):
    """
    Optional evidence from close training signatures.

    It is deliberately limited so a single shortcut symptom cannot
    completely override the trained ensemble.
    """
    try:
        training = pd.read_csv(DATA_PATH, usecols=feature_names + ["prognosis"])
    except Exception as exc:
        print(f"[Predictor] Training-data evidence unavailable: {exc}")
        return None

    X = training[feature_names].astype(np.uint8).to_numpy()
    y = training["prognosis"].to_numpy()
    query = x[0]

    symptom_count = int(query.sum())
    if symptom_count == 0:
        return None

    # Number of differing binary symptom columns.
    distances = np.count_nonzero(X != query, axis=1)
    best_distance = int(distances.min())

    # For very broad/unusual queries, don't use empirical evidence.
    threshold = max(3, int(np.ceil(symptom_count * 0.35)))
    if best_distance > threshold:
        return None

    closest = np.flatnonzero(distances == best_distance)

    # Avoid creating huge temporary objects.
    if len(closest) > 5000:
        closest = closest[:5000]

    counts = pd.Series(y[closest]).value_counts()
    total = float(counts.sum())

    evidence = np.zeros(len(prediction_classes), dtype=float)
    class_index = {c: i for i, c in enumerate(prediction_classes)}

    for disease, count in counts.items():
        idx = class_index.get(disease)
        if idx is not None:
            evidence[idx] = float(count) / total

    return {
        "best_distance": best_distance,
        "matching_rows": int(len(closest)),
        "probabilities": evidence,
    }


def predict_disease(data):
    """
    Main API used by prediction_routes.py.

    Expected:
        {"symptoms": ["Itching Of Skin", "Skin Rash"]}

    Also accepts a plain list of symptoms for compatibility.
    """
    if isinstance(data, dict):
        symptoms = data.get("symptoms", [])
    else:
        symptoms = data

    matched, unmatched = normalize_symptoms(symptoms)

    print(f"[Predictor] Received symptoms: {symptoms}")
    print(f"[Predictor] Matched symptoms: {matched}")

    if unmatched:
        print(f"[Predictor] Unmatched symptoms: {unmatched}")

    if not matched:
        raise ValueError(
            "No recognized symptoms were provided. "
            f"Received: {list(symptoms) if symptoms is not None else []}"
        )

    x = _make_input(matched)
    rf_prob, nb_prob, xgb_prob, ensemble_prob = _get_probabilities(x)

    # Training evidence is optional and capped at 20%.
    evidence = _training_evidence(x)

    final_prob = ensemble_prob.copy()
    evidence_used = False

    if evidence is not None:
        final_prob = 0.80 * ensemble_prob + 0.20 * evidence["probabilities"]
        evidence_used = True

    order = np.argsort(final_prob)[::-1]
    top_indices = order[:3]
    top_index = int(top_indices[0])

    suggestions = []
    for idx in top_indices:
        idx = int(idx)
        suggestions.append({
            "disease": str(prediction_classes[idx]),
            "confidence": round(float(final_prob[idx] * 100), 1),
        })

    return {
        "rf_prediction": str(prediction_classes[int(np.argmax(rf_prob))]),
        "nb_prediction": str(prediction_classes[int(np.argmax(nb_prob))]),
        "xgb_prediction": str(prediction_classes[int(np.argmax(xgb_prob))]),
        "final_prediction": str(prediction_classes[top_index]),
        "disease_suggestions": suggestions,
        "matched_symptoms": matched,
        "unmatched_symptoms": unmatched,
        "confidence_scores": {
            "rf": round(float(rf_prob.max() * 100), 1),
            "nb": round(float(nb_prob.max() * 100), 1),
            "xgb": round(float(xgb_prob.max() * 100), 1),
            "ensemble": round(float(final_prob[top_index] * 100), 1),
        },
        "prediction_type": "ml_ensemble",
        "training_data_evidence": {
            "used": evidence_used,
            **(
                {
                    "best_distance": evidence["best_distance"],
                    "matching_rows": evidence["matching_rows"],
                }
                if evidence is not None else {}
            ),
        },
    }


# Compatibility aliases for any other code using the old function name.
def get_prediction(data):
    return predict_disease(data)


def predict(data):
    return predict_disease(data)
