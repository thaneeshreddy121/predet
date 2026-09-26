import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const PreviousPredictions = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const { user, isAuthenticated } = useContext(AuthContext);

  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================================
  // FETCH PREVIOUS PREDICTIONS
  // ==========================================================

  const fetchPreviousPredictions = async () => {
    if (!isAuthenticated || !user || !user.id) {
      setError("User not authenticated or missing user ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/prediction/previous-predictions?user_id=${user.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch predictions");
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching predictions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // DELETE PREDICTION
  // ==========================================================

  const deletePrediction = async (id) => {
    if (!user || !user.id) {
      setError("User not authenticated");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this prediction?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${BASE_URL}/prediction/delete_prediction`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, prediction_id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete prediction");
      }

      setPredictions((previous) => previous.filter((prediction) => prediction._id !== id));
    } catch (err) {
      console.error("Error deleting prediction:", err);
      setError(err.message);
    }
  };

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      fetchPreviousPredictions();
    }
  }, [isAuthenticated, user]);

  // ==========================================================
  // FORMAT CONFIDENCE
  // ==========================================================

  const formatConfidence = (value) => {
    if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
      return "N/A";
    }
    return `${Number(value).toFixed(2)}%`;
  };

  // ==========================================================
  // RENDER CONFIDENCE SCORES
  // ==========================================================

  const renderConfidenceScores = (prediction) => {
    const scores = prediction.confidence_scores || {};
    const predictionType = prediction.prediction_type || "ml_ensemble";

    if (predictionType === "rule-based") {
      return <div>Rule-based: {formatConfidence(scores.rule_based)}</div>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <div>RF: {formatConfidence(scores.rf)}</div>
        <div>NB: {formatConfidence(scores.nb)}</div>
        <div>XGB: {formatConfidence(scores.xgb)}</div>
        <div>Ensemble: {formatConfidence(scores.ensemble)}</div>
      </div>
    );
  };

  // ==========================================================
  // RENDER MODEL PREDICTIONS
  // ==========================================================

  const renderPredictions = (prediction) => {
    const finalPrediction = prediction.final_prediction;
    const predictionType = prediction.prediction_type || "ml_ensemble";

    if (predictionType === "rule-based" || Array.isArray(finalPrediction)) {
      return (
        <div>
          {Array.isArray(finalPrediction)
            ? finalPrediction.map((pred, index) => <div key={index}>{pred}</div>)
            : finalPrediction}
        </div>
      );
    }

    const fp = finalPrediction || {};
    const rfPrediction = fp.rf_prediction || "N/A";
    const nbPrediction = fp.nb_prediction || "N/A";
    const xgbPrediction = fp.xgb_prediction || "N/A";
    const ensemblePrediction = fp.ensemble_prediction || "N/A";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <div>RF: {rfPrediction}</div>
        <div>NB: {nbPrediction}</div>
        <div>XGB: {xgbPrediction}</div>
        <div>Ensemble: {ensemblePrediction}</div>
      </div>
    );
  };

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  if (!isAuthenticated) {
    return (
      <div className="state-page">
        <div className="state-card message-animation">
          <h2>Sign in to view your history</h2>
          <p>Your previous predictions are saved to your account.</p>
          <a href="/login" className="btn btn-primary">
            Log in
          </a>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="state-page">
        <div className="state-card message-animation">
          <div className="spinner" />
          <h2>Loading your predictions…</h2>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="state-page">
        <div className="state-card message-animation">
          <h2>Something went wrong</h2>
          <div className="state-banner state-banner--error" style={{ textAlign: "left" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="history-page">
      <div className="history-shell message-animation">
        <div className="history-header">
          <h2>Previous predictions</h2>
          <span className="history-count">
            {predictions.length} {predictions.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="history-body">
          {predictions.length === 0 ? (
            <div className="history-empty">
              <p>No previous predictions found yet — run a symptom check to start your history.</p>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Disease</th>
                  <th>Type</th>
                  <th>Confidence</th>
                  <th>Predictions</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction._id}>
                    <td data-label="Date">
                      {prediction.created_at
                        ? new Date(prediction.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td data-label="Symptoms">
                      {Array.isArray(prediction.symptoms)
                        ? prediction.symptoms.join(", ")
                        : "N/A"}
                    </td>

                    <td data-label="Disease" style={{ fontWeight: 600 }}>
                      {prediction.disease_name || "N/A"}
                    </td>

                    <td data-label="Type">
                      <span
                        className={`history-badge ${
                          prediction.prediction_type === "rule-based"
                            ? "history-badge--rule"
                            : "history-badge--ml"
                        }`}
                      >
                        {prediction.prediction_type === "rule-based" ? "Rule-based" : "ML"}
                      </span>
                    </td>

                    <td data-label="Confidence">{renderConfidenceScores(prediction)}</td>

                    <td data-label="Predictions">{renderPredictions(prediction)}</td>

                    <td data-label="Actions" style={{ textAlign: "center" }}>
                      <button
                        onClick={() => deletePrediction(prediction._id)}
                        className="history-delete-btn"
                        title="Delete prediction"
                        aria-label="Delete prediction"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviousPredictions;
