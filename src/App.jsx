
import "./App.css";

import {
  Route,
  Routes
} from "react-router-dom";

import {
  AuthProvider
} from "./context/AuthContext";


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


function App() {

  return (

    <AuthProvider>

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

    </AuthProvider>
  );
}




export default App;
