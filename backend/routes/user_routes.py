import os
import csv

from flask import Blueprint, request, jsonify
from services.user_service import predict_disease
from database import mongo


user_bp = Blueprint("user", __name__)


# ============================================================
# DISEASE PREDICTION
# ============================================================

@user_bp.route("/predict-disease", methods=["POST"])
def predict_disease_api():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        symptoms = data.get("symptoms", [])

        if not symptoms:
            return jsonify({"error": "No symptoms provided"}), 400

        prediction = predict_disease(symptoms)

        return jsonify(prediction), 200

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({
            "error": "Failed to predict disease",
            "details": str(e)
        }), 500


# ============================================================
# DISEASE PRECAUTIONS
# ============================================================

@user_bp.route("/disease/precautions", methods=["GET"])
def get_precautions():
    try:
        disease = request.args.get("disease")

        if not disease:
            return jsonify({
                "error": "Disease name is required"
            }), 400

        # ----------------------------------------------------
        # 1. Try MongoDB first
        # ----------------------------------------------------
        try:
            if mongo.db is not None:
                disease_doc = mongo.db.diseases.find_one({
                    "name": {
                        "$regex": f"^{disease}$",
                        "$options": "i"
                    }
                })

                if disease_doc:
                    precautions = disease_doc.get("precautions", [])

                    return jsonify({
                        "disease": disease_doc.get("name", disease),
                        "precautions": precautions
                    }), 200

        except Exception as mongo_error:
            print(f"MongoDB precaution lookup failed: {mongo_error}")

        # ----------------------------------------------------
        # 2. Fallback to precautions.csv
        # ----------------------------------------------------
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "datasets",
            "precautions.csv"
        )

        if not os.path.exists(csv_path):
            return jsonify({
                "error": "Precautions data not found"
            }), 404

        with open(
            csv_path,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                csv_disease = (
                    row.get("Disease", "")
                    or row.get("disease", "")
                ).strip()

                if csv_disease.lower() == disease.strip().lower():

                    precautions = []

                    for i in range(1, 5):
                        value = row.get(f"Precaution_{i}", "")

                        if value and value.strip():
                            precautions.append(value.strip())

                    return jsonify({
                        "disease": csv_disease,
                        "precautions": precautions
                    }), 200

        # ----------------------------------------------------
        # Disease not found
        # ----------------------------------------------------
        return jsonify({
            "error": "Precautions not found for this disease"
        }), 404

    except Exception as e:
        print(f"Precautions error: {e}")

        return jsonify({
            "error": "Failed to retrieve precautions",
            "details": str(e)
        }), 500