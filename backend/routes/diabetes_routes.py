from flask import Blueprint, jsonify, request

from services.diabetes_predictor import predict_diabetes


diabetes_bp = Blueprint("diabetes", __name__)


@diabetes_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True) or {}
        result = predict_diabetes(data)
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": "Diabetes prediction failed.", "details": str(exc)}), 500
