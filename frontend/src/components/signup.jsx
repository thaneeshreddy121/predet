import { useState } from "react";
import { Link } from "react-router-dom";
import caduceus from "../assets/caduceus.png";

export default function Signup() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    address: "",
    contact_no: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("User registered successfully! You can now log in.");
      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        age: "",
        address: "",
        contact_no: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* IMAGE / BRAND SIDE */}
      <div className="auth-visual">
        <p className="auth-visual-eyebrow">PREDET-AI • CREATE ACCOUNT</p>
        <h2 className="auth-visual-title">Start tracking your health signals</h2>
        <p className="auth-visual-copy">
          Create an account to save every prediction, revisit your diabetes
          risk history, and get results tailored to you.
        </p>
        <img src={caduceus} alt="" />
      </div>

      {/* FORM SIDE */}
      <div className="auth-form-side">
        <div className="auth-panel message-animation" style={{ maxWidth: "460px" }}>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-subtitle">A few details and you're set.</p>

          {error && (
            <div className="state-banner state-banner--error message-animation" style={{ marginBottom: "1.1rem" }}>
              {error}
            </div>
          )}

          {success && (
            <div className="state-banner state-banner--success message-animation" style={{ marginBottom: "1.1rem" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-grid-2">
              <div className="field">
                <label className="field-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div className="auth-grid-2">
              <div className="field">
                <label className="field-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Age</label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Address</label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                className="field-textarea"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Phone number</label>
              <input
                type="text"
                name="contact_no"
                value={formData.contact_no}
                onChange={handleChange}
                className="field-input"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Gender</label>
              <div className="auth-gender-group">
                {["male", "female"].map((gender) => (
                  <label key={gender} className="auth-gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={handleChange}
                    />
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-note">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
