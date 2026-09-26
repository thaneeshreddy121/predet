import { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import { LifeLine } from "react-loading-indicators";
import { AuthContext } from "../context/AuthContext";

const SymptomPredictor = ({ onPredictionStart, onPredictionResult }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [inputValue, setInputValue] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [fileError, setFileError] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const loadSymptoms = async () => {
      try {
        const response = await fetch("/symptoms.txt");
        if (!response.ok) {
          throw new Error("Failed to load symptoms file");
        }
        const text = await response.text();
        const symptoms = [
          ...new Set(
            text
              .split("\n")
              .map((symptom) => symptom.trim())
              .filter((symptom) => symptom.length > 0)
          ),
        ];

        setAllSymptoms(symptoms);
      } catch (err) {
        console.error("Error loading symptoms:", err);
        setFileError("Failed to load symptoms list. Please try again later.");
      }
    };

    loadSymptoms();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const filtered = allSymptoms.filter(
        (symptom) =>
          symptom.toLowerCase().includes(value.toLowerCase()) && !symptoms.includes(symptom)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const removeSymptom = (symptomToRemove) => {
    setSymptoms(symptoms.filter((symptom) => symptom !== symptomToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      addSymptom(suggestions[0]);
    }
  };

  const resetFields = () => {
    setInputValue("");
    setSymptoms([]);
    setSuggestions([]);
    setPrediction(null);
    setError(null);
  };

  const getPrediction = async () => {
    if (symptoms.length === 0) {
      setError("Please add at least one symptom");
      return;
    }

    setLoading(true);
    setError(null);
    if (onPredictionStart) onPredictionStart();

    try {
      const payload = { symptoms };

      if (isAuthenticated && user?.id) {
        payload.user_id = user.id;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/prediction/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Prediction failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPrediction(data);

      if (onPredictionResult && typeof onPredictionResult === "function") {
        onPredictionResult(data);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError(`Failed to get prediction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fileError) {
    return <div className="state-banner state-banner--error message-animation">{fileError}</div>;
  }

  const renderFinalPrediction = () => {
    if (!prediction || !prediction.final_prediction) return null;

    const diseases = Array.isArray(prediction.final_prediction)
      ? prediction.final_prediction
      : [prediction.final_prediction];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
        {diseases.map((disease, index) => (
          <div key={index} className="predict-result-disease">
            {disease}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(22, 35, 31, 0.55)",
            backdropFilter: "blur(4px)",
            borderRadius: "var(--radius-m)",
            zIndex: 10,
          }}
        >
          <LifeLine color="var(--pulse)" size="medium" text="Predicting..." />
        </div>
      )}

      <div className={loading ? "message-animation" : ""} style={{ opacity: loading ? 0.4 : 1 }}>
        <div
          style={{
            border: "1px solid var(--mist-dark)",
            borderRadius: "var(--radius-m)",
            padding: "0.6rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: symptoms.length ? "0.5rem" : 0 }}>
            {symptoms.map((symptom) => (
              <span key={symptom} className="predict-tag">
                {symptom}
                <button onClick={() => removeSymptom(symptom)} aria-label={`Remove ${symptom}`}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <div className="predict-input-row">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a symptom…"
              className="field-input"
            />
            <button onClick={resetFields} className="btn btn-ghost" style={{ flexShrink: 0 }}>
              Reset
            </button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="predict-suggestion-list">
            {suggestions.slice(0, 8).map((suggestion) => (
              <button key={suggestion} onClick={() => addSymptom(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {!isAuthenticated && (
          <div className="state-banner state-banner--info message-animation" style={{ marginTop: "1rem" }}>
            Sign in to save your prediction history.
          </div>
        )}

        <button
          onClick={getPrediction}
          disabled={loading || symptoms.length === 0}
          className="btn btn-primary btn-block"
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Predicting…" : "Predict Disease"}
        </button>

        {error && <div className="state-banner state-banner--error message-animation" style={{ marginTop: "1rem" }}>{error}</div>}

        {prediction && (
          <div
            style={{
              marginTop: "1.25rem",
              border: "1px solid var(--mist)",
              borderRadius: "var(--radius-m)",
              padding: "1.1rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem", color: "var(--ink)" }}>Prediction results</h3>
            <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "var(--ink)" }}>Most likely disease:</p>
            {renderFinalPrediction()}

            {Array.isArray(prediction.disease_suggestions) && prediction.disease_suggestions.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--ink)" }}>Possible diseases:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {prediction.disease_suggestions.map((item, index) => (
                    <div
                      key={item.disease || index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--paper)",
                        border: "1px solid var(--mist)",
                        borderRadius: "var(--radius-s)",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span>
                        {index + 1}. {item.disease}
                      </span>
                      {typeof item.confidence === "number" && (
                        <span style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
                          {item.confidence.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(prediction.unmatched_symptoms) && prediction.unmatched_symptoms.length > 0 && (
              <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--alert)" }}>
                Not recognized by the model: {prediction.unmatched_symptoms.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomPredictor;
