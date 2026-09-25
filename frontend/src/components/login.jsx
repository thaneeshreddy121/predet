import React, {
  useState,
  useContext
} from "react";

import caduceus from "../assets/caduceus.png";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  AuthContext
} from "../context/AuthContext";


export default function Login() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  const { login } =
    useContext(AuthContext);

  const BASE_URL =
    import.meta.env.VITE_BASE_URL;


  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");
      setLoading(true);

      try {

        const response =
          await fetch(
            `${BASE_URL}/auth/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                email,
                password
              })
            }
          );

        const data =
          await response.json();

        if (response.ok) {

          login(
            data.user,
            data.token
          );

          navigate("/");

        } else {

          setError(
            data.error ||
            "Login failed. Please try again."
          );
        }

      } catch (err) {

        setError(
          "Server error. Please try again later."
        );

      } finally {

        setLoading(false);
      }
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div
      className="flex flex-col md:flex-row bg-white"
      style={{
        minHeight:
          "calc(100vh - 64px)"
      }}
    >

      {/* ====================================================
          IMAGE SECTION
          ==================================================== */}

      <div className="hidden md:flex md:w-1/2 md:flex-1 md:items-center md:justify-center">

        <img
          src={caduceus}
          alt="Staff"
        />

      </div>


      {/* ====================================================
          FORM SECTION
          ==================================================== */}

      <div className="flex flex-col flex-1 px-4 py-6 md:px-6 lg:px-8">

        <div className="mx-auto w-full max-w-sm">

          <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-gray-900">

            Log in

          </h2>

        </div>


        <div className="mt-6 mx-auto w-full max-w-sm bg-slate-50 px-6 py-5 md:px-10 rounded-lg shadow-sm">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ==================================================
                EMAIL
                ================================================== */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >

                Email address

              </label>

              <div className="mt-2">

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                />

              </div>

            </div>


            {/* ==================================================
                PASSWORD
                ================================================== */}

            <div>

              <div className="flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >

                  Password

                </label>


                {/* =================================================
                    FUNCTIONAL FORGOT PASSWORD LINK
                    ================================================= */}

                <div className="text-sm">

                  <Link
                    to="/forgot-password"
                    className="font-semibold text-[#FF6F00] hover:text-[#D65C00]"
                  >

                    Forgot password?

                  </Link>

                </div>

              </div>


              <div className="mt-2">

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                />

              </div>

            </div>


            {/* ==================================================
                ERROR
                ================================================== */}

            {error && (

              <p className="text-red-500 text-sm">

                {error}

              </p>

            )}


            {/* ==================================================
                LOGIN BUTTON
                ================================================== */}

            <div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-[#FF6F00] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d65c00] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >

                {loading
                  ? "Logging in..."
                  : "Log in"}

              </button>

            </div>

          </form>


          {/* ==================================================
              SIGN UP
              ================================================== */}

          <p className="mt-6 text-center text-sm text-gray-500">

            Don't have an account yet?{" "}

            <Link
              to="/signup"
              className="text-[#FF6F00] hover:text-[#D65C00] font-semibold"
            >

              Sign up

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}