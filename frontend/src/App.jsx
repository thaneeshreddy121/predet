import "./App.css";

import {
  Route,
  Routes
} from "react-router-dom";

import {
  AuthProvider,
  AuthContext
} from "./context/AuthContext";

import {
  useContext
} from "react";

import HomePage
  from "./components/mainHome";

import Login
  from "./components/login";

import Signup
  from "./components/signup";

import ForgotPassword
  from "./components/ForgotPassword";

import Predict
  from "./components/Predict";

import Navbar
  from "./components/Navbar";

import AboutUs
  from "./components/AboutUs";

import ContactUsPage
  from "./components/ContactUsPage";

import PreviousPrediction
  from "./components/PreviousPrediction";

import DiabetesPredictor
  from "./components/DiabetesPredictor";


function AppContent() {

  const { loading } = useContext(AuthContext);

  // Wait until the stored token has been verified
  // before rendering the application.
  if (loading) {
    return (
      <div className="App">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="App">

      <Navbar />

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/signup"
          element={
            <Signup />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        {/* Disease Prediction */}
        <Route
          path="/predict"
          element={
            <Predict />
          }
        />

        {/* Diabetes */}
        <Route
          path="/diabetes"
          element={
            <DiabetesPredictor />
          }
        />

        {/* Information */}
        <Route
          path="/aboutus"
          element={
            <AboutUs />
          }
        />

        <Route
          path="/contact"
          element={
            <ContactUsPage />
          }
        />

        {/* Prediction History */}
        <Route
          path="/previous-predictions"
          element={
            <PreviousPrediction />
          }
        />

      </Routes>

    </div>
  );
}


function App() {

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


export default App;