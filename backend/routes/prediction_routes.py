import datetime
import os

from bson import ObjectId
from flask import Blueprint, current_app, request, jsonify

from services.predictor import predict_disease
from database import mongo


prediction_bp = Blueprint("prediction", __name__)


# ============================================================
# DISEASE PREDICTION
# ============================================================

@prediction_bp.route("/predict", methods=["POST"])
def predict():
    try:
        input_json = request.get_json(silent=True) or {}

        symptoms = input_json.get("symptoms", [])
        user_id = input_json.get("user_id")

        if not isinstance(symptoms, list) or not symptoms:
            return jsonify({
                "error": "Please provide at least one symptom."
            }), 400

        print(f"Received symptoms: {symptoms}")

        # Generate ML prediction
        prediction_response = predict_disease({
            "symptoms": symptoms
        })

        disease_name = prediction_response["final_prediction"]

        # Check MongoDB availability
        mongo_enabled = (
            bool(current_app.config.get("MONGO_URI"))
            and os.getenv("DISABLE_MONGO", "0") != "1"
        )

        disease_doc = None

        # Find disease information in MongoDB
        if mongo_enabled:
            try:
                if mongo.db is not None:
                    disease_docs = list(
                        mongo.db.diseases.find(
                            {"name": disease_name}
                        ).limit(1)
                    )

                    if disease_docs:
                        disease_doc = disease_docs[0]

            except Exception as db_error:
                print(
                    f"MongoDB disease lookup skipped: {db_error}"
                )

        # Add disease database information
        if disease_doc:
            prediction_response["disease_id"] = str(
                disease_doc.get("_id")
            )

            specialty_id = disease_doc.get("specialty_id")

            prediction_response["specialty_id"] = (
                str(specialty_id)
                if specialty_id is not None
                else None
            )
        else:
            prediction_response["disease_id"] = None
            prediction_response["specialty_id"] = None

        # Default history status
        prediction_response["saved_to_history"] = False

        # Save prediction if user is logged in
        if user_id:
            try:
                if ObjectId.is_valid(str(user_id)):
                    stored_user_id = ObjectId(str(user_id))
                else:
                    stored_user_id = user_id

                prediction_record = {
                    "user_id": stored_user_id,
                    "symptoms": symptoms,

                    "disease_id": (
                        disease_doc.get("_id")
                        if disease_doc
                        else None
                    ),

                    "disease_name": disease_name,

                    "specialty_id": (
                        disease_doc.get("specialty_id")
                        if disease_doc
                        else None
                    ),

                    # Individual model predictions
                    "rf_prediction": prediction_response.get(
                        "rf_prediction"
                    ),

                    "nb_prediction": prediction_response.get(
                        "nb_prediction"
                    ),

                    "xgb_prediction": prediction_response.get(
                        "xgb_prediction"
                    ),

                    # Weighted ensemble prediction
                    "ensemble_prediction": prediction_response.get(
                        "final_prediction"
                    ),

                    # Final prediction
                    "final_prediction": disease_name,

                    # Additional prediction information
                    "disease_suggestions": prediction_response.get(
                        "disease_suggestions",
                        []
                    ),

                    "prediction_type": prediction_response.get(
                        "prediction_type",
                        "ml_ensemble"
                    ),

                    "confidence_scores": prediction_response.get(
                        "confidence_scores",
                        {}
                    ),

                    "created_at": datetime.datetime.now()
                }

                result = mongo.db.previous_predictions.insert_one(
                    prediction_record
                )

                prediction_response["saved_to_history"] = bool(
                    result.inserted_id
                )

                print(
                    "Prediction saved successfully:",
                    result.inserted_id
                )

            except Exception as db_error:
                print(
                    "Prediction history insertion failed:",
                    db_error
                )

                prediction_response["saved_to_history"] = False

        else:
            print(
                "No user_id supplied. "
                "Prediction was not saved to history."
            )

        return jsonify(prediction_response), 200

    except Exception as e:
        current_app.logger.exception("Prediction error")

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# DELETE PREVIOUS PREDICTION
# ============================================================

@prediction_bp.route(
    "/delete_prediction",
    methods=["DELETE"]
)
def delete_prediction():

    try:
        input_json = request.get_json(silent=True) or {}

        if not input_json:
            return jsonify({
                "error": "No data provided"
            }), 400

        user_id = input_json.get("user_id")
        prediction_id = input_json.get("prediction_id")

        if not user_id or not prediction_id:
            return jsonify({
                "error": "user_id and prediction_id are required"
            }), 400

        print(
            f"Received delete request for "
            f"prediction_id: {prediction_id} "
            f"by user_id: {user_id}"
        )

        # Convert prediction ID
        try:
            prediction_oid = ObjectId(str(prediction_id))
        except Exception:
            return jsonify({
                "error": "Invalid prediction_id format"
            }), 400

        # Convert user ID
        if ObjectId.is_valid(str(user_id)):
            stored_user_id = ObjectId(str(user_id))
        else:
            stored_user_id = user_id

        # Delete only the prediction belonging to this user
        result = mongo.db.previous_predictions.delete_one({
            "_id": prediction_oid,
            "user_id": stored_user_id
        })

        if result.deleted_count == 0:
            return jsonify({
                "error": "No matching prediction found"
            }), 404

        print(
            f"Prediction {prediction_id} deleted successfully"
        )

        return jsonify({
            "message": "Prediction deleted successfully"
        }), 200

    except Exception as e:
        current_app.logger.exception(
            "Error deleting prediction"
        )

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# PREVIOUS PREDICTIONS
# ============================================================

@prediction_bp.route(
    "/previous-predictions",
    methods=["GET"]
)
def fetch_previous_predictions():

    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({
                "error": "User ID is required"
            }), 400

        # Convert user ID to MongoDB ObjectId
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return jsonify({
                "error": "Invalid user ID format"
            }), 400

        # Get predictions for this user
        predictions = list(
            mongo.db.previous_predictions
            .find({"user_id": user_id})
            .sort("created_at", -1)
        )

        processed_predictions = []

        for prediction in predictions:

            # Convert date to JSON-compatible format
            created_at = prediction.get("created_at")

            if created_at:
                try:
                    created_at = created_at.isoformat()
                except Exception:
                    created_at = str(created_at)
            else:
                created_at = None

            processed_pred = {
                "_id": str(
                    prediction.get("_id")
                ),

                "user_id": str(
                    prediction.get("user_id")
                ),

                "symptoms": prediction.get(
                    "symptoms",
                    []
                ),

                "disease_id": (
                    str(
                        prediction.get("disease_id")
                    )
                    if prediction.get("disease_id")
                    else None
                ),

                "disease_name": prediction.get(
                    "disease_name",
                    prediction.get("final_prediction")
                ),

                "specialty_id": (
                    str(
                        prediction.get("specialty_id")
                    )
                    if prediction.get("specialty_id")
                    else None
                ),

                "created_at": created_at,

                "prediction_type": prediction.get(
                    "prediction_type",
                    "ml_ensemble"
                )
            }

            # Get individual model predictions
            final_prediction = prediction.get(
                "final_prediction"
            )

            rf_prediction = prediction.get(
                "rf_prediction"
            )

            nb_prediction = prediction.get(
                "nb_prediction"
            )

            xgb_prediction = prediction.get(
                "xgb_prediction"
            )

            ensemble_prediction = prediction.get(
                "ensemble_prediction"
            )

            # Support older database records
            if not rf_prediction:
                rf_prediction = final_prediction

            if not nb_prediction:
                nb_prediction = final_prediction

            if not xgb_prediction:
                xgb_prediction = final_prediction

            if not ensemble_prediction:
                ensemble_prediction = final_prediction

            # Return all model predictions
            processed_pred["final_prediction"] = {
                "rf_prediction": rf_prediction,
                "nb_prediction": nb_prediction,
                "xgb_prediction": xgb_prediction,
                "ensemble_prediction": ensemble_prediction
            }

            # Confidence scores
            confidence_scores = prediction.get(
                "confidence_scores",
                {}
            )

            processed_pred["confidence_scores"] = {
                "rf": confidence_scores.get("rf"),
                "nb": confidence_scores.get("nb"),
                "xgb": confidence_scores.get("xgb"),
                "ensemble": confidence_scores.get("ensemble"),
                "rule_based": confidence_scores.get("rule_based")
            }

            # Disease suggestions
            processed_pred["disease_suggestions"] = prediction.get(
                "disease_suggestions",
                []
            )

            # Unmatched symptoms
            if "unmatched_symptoms" in prediction:
                processed_pred["unmatched_symptoms"] = prediction[
                    "unmatched_symptoms"
                ]

            processed_predictions.append(
                processed_pred
            )

        return jsonify({
            "predictions": processed_predictions
        })

    except Exception as e:
        current_app.logger.error(
            "Error fetching previous predictions: "
            f"{str(e)}"
        )

        return jsonify({
            "error": "Failed to fetch previous predictions",
            "details": str(e)
        }), 500