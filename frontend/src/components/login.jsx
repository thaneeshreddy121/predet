import React, { useState, useContext } from "react";
import caduceus from "../assets/caduceus.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate("/");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="auth-shell">
      {/* IMAGE / BRAND SIDE */}
      <div className="auth-visual">
        <p className="auth-visual-eyebrow">PREDET-AI • SECURE ACCESS</p>
        <h2 className="auth-visual-title">Welcome back to your health record</h2>
        <p className="auth-visual-copy">
          Sign in to pick up where you left off — saved predictions, your
          diabetes history, and a faster path from symptoms to answers.
        </p>
        <img src={caduceus} alt="" />
      </div>

      {/* FORM SIDE */}
      <div className="auth-form-side">
        <div className="auth-panel message-animation">
          <h2 className="auth-title">Log in</h2>
          <p className="auth-subtitle">Enter your details to access your account.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="email" className="field-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="field">
              <div className="auth-row-between">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="state-banner state-banner--error message-animation">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="auth-footer-note">
            Don't have an account yet? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
