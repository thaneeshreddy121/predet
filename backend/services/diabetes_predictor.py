"""
Diabetes prediction service.

This preserves the original DiabetesPrediction project's LogisticRegression
approach, but trains the model once and reuses it for subsequent requests.
"""
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parents[1]
DATASET_PATH = BASE_DIR / "datasets" / "diabetes_dataset.csv"

FEATURES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

_model = None


def _load_model():
    global _model

    if _model is None:
        data = pd.read_csv(DATASET_PATH)
        X = data[FEATURES]
        y = data["Outcome"]

        # Same basic algorithm as the original Django diabetes project.
        X_train, _, y_train, _ = train_test_split(
            X, y, test_size=0.2, shuffle=False
        )
        _model = LogisticRegression(max_iter=1000)
        _model.fit(X_train, y_train)

    return _model


def predict_diabetes(values):
    """Return a diabetes prediction and model probability."""
    missing = [name for name in FEATURES if name not in values]
    if missing:
        raise ValueError(f"Missing fields: {', '.join(missing)}")

    try:
        row = [float(values[name]) for name in FEATURES]
    except (TypeError, ValueError):
        raise ValueError("All diabetes measurements must be numeric.")

    model = _load_model()
    prediction = int(model.predict([row])[0])
    probabilities = model.predict_proba([row])[0]

    return {
        "prediction": prediction,
        "label": "Positive for diabetes" if prediction == 1 else "Negative for diabetes",
        "probability": round(float(probabilities[prediction]) * 100, 2),
        "model": "Logistic Regression",
    }
