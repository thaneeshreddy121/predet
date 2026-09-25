import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function ForgotPassword() {

  const BASE_URL =
    import.meta.env.VITE_BASE_URL;

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [step, setStep] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [devOtp, setDevOtp] =
    useState("");


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

      const response =
        await fetch(
          `${BASE_URL}/auth/forgot-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Unable to send OTP"
        );
      }

      setMessage(
        data.message ||
        "OTP sent successfully."
      );

      // ------------------------------------------------------
      // Development mode
      // ------------------------------------------------------

      if (data.dev_otp) {

        setDevOtp(
          data.dev_otp
        );
      }

      setStep(2);

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleResetPassword =
    async (e) => {

      e.preventDefault();

      setError("");
      setMessage("");

      // ------------------------------------------------------
      // Password validation
      // ------------------------------------------------------

      if (
        newPassword.length < 6
      ) {

        setError(
          "Password must be at least 6 characters long."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        );

        return;
      }

      if (!otp) {

        setError(
          "Please enter the OTP."
        );

        return;
      }

      setLoading(true);

      try {

        const response =
          await fetch(
            `${BASE_URL}/auth/reset-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                email,

                otp,

                new_password:
                  newPassword

              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data.error ||
            "Unable to reset password"
          );
        }

        setMessage(
          data.message ||
          "Password reset successfully."
        );

        // ----------------------------------------------------
        // Redirect to login
        // ----------------------------------------------------

        setTimeout(() => {

          navigate("/login");

        }, 1500);

      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);
      }
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="min-h-screen flex items-center justify-center bg-white px-4">

      <div className="w-full max-w-md">

        {/* ==================================================
            TITLE
            ================================================== */}

        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">

          {step === 1
            ? "Forgot Password"
            : "Reset Password"}

        </h2>


        {/* ==================================================
            CARD
            ================================================== */}

        <div className="mt-6 bg-slate-50 px-6 py-6 rounded-lg shadow-sm">


          {/* =================================================
              STEP 1
              ================================================= */}

          {step === 1 && (

            <form
              onSubmit={
                handleSendOtp
              }
              className="space-y-6"
            >

              <p className="text-sm text-gray-600">

                Enter the email address
                associated with your MEDS-AI
                account. We will send you a
                password reset OTP.

              </p>


              {/* EMAIL */}

              <div>

                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-900"
                >

                  Email address

                </label>

                <div className="mt-2">

                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                    placeholder="Enter your email"
                  />

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <p className="text-red-500 text-sm">

                  {error}

                </p>

              )}


              {/* MESSAGE */}

              {message && (

                <p className="text-green-600 text-sm">

                  {message}

                </p>

              )}


              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-[#FF6F00] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#d65c00] disabled:opacity-60"
              >

                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}

              </button>

            </form>

          )}


          {/* =================================================
              STEP 2
              ================================================= */}

          {step === 2 && (

            <form
              onSubmit={
                handleResetPassword
              }
              className="space-y-6"
            >

              <p className="text-sm text-gray-600">

                Enter the OTP sent to:

              </p>

              <p className="font-semibold text-gray-900">

                {email}

              </p>


              {/* DEVELOPMENT OTP */}

              {devOtp && (

                <div className="rounded-md bg-yellow-50 border border-yellow-300 p-3">

                  <p className="text-xs text-yellow-800">

                    Development mode:

                  </p>

                  <p className="text-lg font-bold tracking-widest text-yellow-900">

                    {devOtp}

                  </p>

                  <p className="text-xs text-yellow-700 mt-1">

                    Configure SMTP later to
                    receive OTP by email.

                  </p>

                </div>

              )}


              {/* OTP */}

              <div>

                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-900"
                >

                  OTP

                </label>

                <div className="mt-2">

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    className="block w-full rounded-md bg-white px-3 py-2 text-center text-lg tracking-widest text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                    placeholder="000000"
                  />

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div>

                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-900"
                >

                  New password

                </label>

                <div className="mt-2">

                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength="6"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                    placeholder="New password"
                  />

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-900"
                >

                  Confirm password

                </label>

                <div className="mt-2">

                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength="6"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                    placeholder="Confirm password"
                  />

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <p className="text-red-500 text-sm">

                  {error}

                </p>

              )}


              {/* MESSAGE */}

              {message && (

                <p className="text-green-600 text-sm">

                  {message}

                </p>

              )}


              {/* RESET BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-[#FF6F00] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#d65c00] disabled:opacity-60"
              >

                {loading
                  ? "Resetting password..."
                  : "Reset Password"}

              </button>


              {/* BACK */}

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
                className="w-full text-sm font-semibold text-[#FF6F00] hover:text-[#D65C00]"
              >

                Use a different email

              </button>

            </form>

          )}


          {/* =================================================
              LOGIN
              ================================================= */}

          <p className="mt-6 text-center text-sm text-gray-500">

            Remember your password?{" "}

            <Link
              to="/login"
              className="text-[#FF6F00] hover:text-[#D65C00] font-semibold"
            >

              Log in

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}