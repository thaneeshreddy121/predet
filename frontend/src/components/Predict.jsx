import React, { useState } from "react";
import SymptomPredictor from "./SymptomPredictor";

const Predict = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [precautions, setPrecautions] = useState([]);
  const [precautionsLoading, setPrecautionsLoading] = useState(false);

  const handlePredictionStart = () => {
    setIsPredicting(true);
    setPrediction(null);
    setPrecautions([]);
  };

  const fetchPrecautions = async (diseases) => {
    setPrecautionsLoading(true);
    try {
      if (!Array.isArray(diseases)) {
        diseases = [diseases]; // Ensure diseases is always an array
      }

      const precautionsData = await Promise.all(
        diseases.map(async (disease) => {
          const response = await fetch(
            `${BASE_URL}/user/disease/precautions?disease=${encodeURIComponent(disease)}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch precautions for ${disease}`);
          }
          return response.json();
        })
      );

      setPrecautions(precautionsData);
    } catch (error) {
      console.error("Error fetching precautions:", error);
      setPrecautions([]);
    } finally {
      setPrecautionsLoading(false);
    }
  };

  const handlePredictionResult = async (predictionData) => {
    setIsPredicting(false);

    const finalPrediction = Array.isArray(predictionData) ? predictionData[0] : predictionData;
    setPrediction(finalPrediction);

    if (finalPrediction && finalPrediction.final_prediction) {
      const diseases = Array.isArray(finalPrediction.final_prediction)
        ? finalPrediction.final_prediction
        : [finalPrediction.final_prediction];

      fetchPrecautions(diseases);
    }
  };

  return (
    <div className="predict-page">
      <div className="predict-grid">
        {/* Prediction Column */}
        <div className="predict-panel message-animation">
          <h2>Symptom analysis</h2>
          <SymptomPredictor
            onPredictionStart={handlePredictionStart}
            onPredictionResult={handlePredictionResult}
          />
        </div>

        {/* Precautions Column */}
        <div className="predict-panel message-animation">
          <h2>Disease precautions</h2>

          {isPredicting ? (
            <div className="predict-empty">
              <div className="spinner" />
              <p>Processing your symptoms…</p>
            </div>
          ) : precautionsLoading ? (
            <div className="predict-empty">
              <div className="spinner" />
              <p>Loading precautions…</p>
            </div>
          ) : precautions && precautions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {precautions.map((item, idx) => (
                <div key={idx}>
                  <h3 style={{ fontSize: "1.05rem", margin: "0 0 0.5rem", color: "var(--ink)" }}>
                    {item.disease} precautions
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--ink-soft)" }}>
                    {item.precautions
                      .filter((precaution) => precaution !== "nan")
                      .map((precaution, index) => (
                        <li key={index} style={{ fontSize: "0.92rem", marginBottom: "0.35rem" }}>
                          {precaution}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="predict-empty">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <p>Precautions will appear here once a prediction is made.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predict;
