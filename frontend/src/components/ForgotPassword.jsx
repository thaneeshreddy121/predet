import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState("");

  // ==========================================================
  // REQUEST OTP
  // ==========================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setDevOtp("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send OTP");
      }

      setMessage(data.message || "OTP sent successfully.");

      if (data.dev_otp) {
        setDevOtp(data.dev_otp);
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to reset password");
      }

      setMessage(data.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="auth-form-side" style={{ minHeight: "calc(100vh - 70px)" }}>
      <div className="auth-panel message-animation">
        <h2 className="auth-title">
          {step === 1 ? "Forgot password" : "Reset password"}
        </h2>
        <p className="auth-subtitle">
          {step === 1
            ? "We'll send a one-time code to your email."
            : "Enter the code and choose a new password."}
        </p>

        {/* =================================================
            STEP 1
            ================================================= */}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem" }}>
              Enter the email address associated with your PREDET-AI account.
            </p>

            <div className="field">
              <label htmlFor="reset-email" className="field-label">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="Enter your email"
              />
            </div>

            {error && <div className="state-banner state-banner--error message-animation">{error}</div>}
            {message && <div className="state-banner state-banner--success message-animation">{message}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}

        {/* =================================================
            STEP 2
            ================================================= */}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem" }}>
              Enter the OTP sent to <strong style={{ color: "var(--ink)" }}>{email}</strong>
            </p>

            {devOtp && (
              <div className="dev-otp-box">
                <p className="dev-otp-label">Development mode</p>
                <p className="dev-otp-code">{devOtp}</p>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "var(--alert)" }}>
                  Configure SMTP later to receive OTP by email.
                </p>
              </div>
            )}

            <div className="field">
              <label htmlFor="otp" className="field-label">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="field-input"
                style={{ textAlign: "center", letterSpacing: "0.4em", fontSize: "1.1rem" }}
                placeholder="000000"
              />
            </div>

            <div className="field">
              <label htmlFor="new-password" className="field-label">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength="6"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="field-input"
                placeholder="New password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirm-password" className="field-label">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength="6"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="field-input"
                placeholder="Confirm password"
              />
            </div>

            {error && <div className="state-banner state-banner--error message-animation">{error}</div>}
            {message && <div className="state-banner state-banner--success message-animation">{message}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Resetting password…" : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setMessage("");
                setDevOtp("");
              }}
              className="btn btn-ghost btn-block"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="auth-footer-note">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
