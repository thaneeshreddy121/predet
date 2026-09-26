import { useState } from "react";

const fields = [
  ["Pregnancies", "Number of pregnancies", "0"],
  ["Glucose", "Glucose level (mg/dL)", "120"],
  ["BloodPressure", "Blood pressure (mmHg)", "70"],
  ["SkinThickness", "Skin thickness (µm)", "20"],
  ["Insulin", "Insulin (µIU/mL)", "80"],
  ["BMI", "BMI (kg/m²)", "25"],
  ["DiabetesPedigreeFunction", "Diabetes pedigree function", "0.5"],
  ["Age", "Age (years)", "30"],
];

const initialState = Object.fromEntries(fields.map(([name, , value]) => [name, value]));

export default function DiabetesPredictor() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:5000";

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const reset = () => {
    setForm(initialState);
    setResult(null);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${baseUrl}/diabetes/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction failed.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="diabetes-page">
      <section className="diabetes-card">
        <div className="diabetes-header">
          <div>
            <p className="diabetes-eyebrow">PREDET-AI • SPECIALIZED DETECTOR</p>
            <h1>Diabetes Risk Detector</h1>
            <p>
              Enter the same eight clinical measurements used by the original
              DiabetesPrediction model.
            </p>
          </div>
          <img src="/diab.svg" alt="" className="diabetes-icon" />
        </div>

        <form onSubmit={submit}>
          <div className="diabetes-grid">
            {fields.map(([name, label, placeholder]) => (
              <label key={name}>
                <span>{label}</span>
                <input
                  name={name}
                  type="number"
                  step="any"
                  min="0"
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                />
              </label>
            ))}
          </div>

          <div className="diabetes-actions">
            <button type="button" className="diabetes-reset" onClick={reset}>
              Reset
            </button>
            <button type="submit" className="diabetes-submit" disabled={loading}>
              {loading ? "Analyzing..." : "Detect Diabetes"}
            </button>
          </div>
        </form>

        {error && <div className="diabetes-error">{error}</div>}

        {result && (
          <div className={`diabetes-result ${result.prediction === 1 ? "positive" : "negative"}`}>
            <div>
              <p className="result-label">Prediction</p>
              <h2>{result.label}</h2>
              <p>Model confidence: <strong>{result.probability}%</strong></p>
              <small>{result.model}</small>
            </div>
            <div className="result-badge">
              {result.prediction === 1 ? "POSITIVE" : "NEGATIVE"}
            </div>
          </div>
        )}

        <p className="medical-note">
          This tool is for educational/informational use and is not a medical
          diagnosis. Consult a qualified healthcare professional for clinical decisions.
        </p>
      </section>
    </main>
  );
}
