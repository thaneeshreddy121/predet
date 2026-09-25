import React, { useState } from "react";

import { Link } from "react-router-dom";

const HomePage = () => {
  // State for controlling popups
  const [showLearnMorePopup, setShowLearnMorePopup] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  // Function to handle the Learn More button click
  const handleLearnMore = () => {
    setShowLearnMorePopup(true);
  };

  // Function to handle the Privacy Policy link click
  const handlePrivacyPolicy = (e) => {
    e.preventDefault();
    setShowPrivacyPopup(true);
  };

  return (
    <div
      className="homepage-container"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Navbar Component */}
      {/* <Navbar /> */}
      <br />

      {/* Hero Section - keeping original structure */}
      <section className="hero-section">
        <h2 className="hero-title">Your Health, Powered by AI</h2>
        <p className="hero-description">
          Start predicting diseases with our advanced AI models and take charge
          of your health.
        </p>
        <div className="cta-buttons">
          <Link to="/predict"><button className="cta-btn">Disease Prediction</button></Link>
          <Link to="/diabetes"><button className="cta-btn">Diabetes Detector</button></Link>
          
          <button className="cta-btn" onClick={handleLearnMore}>Learn More</button>
        </div>
        {/* <img className="hero-image" src={healthApp} alt="image" /> */}
      </section>

      {/* Features Section - keeping original layout */}
      <section className="features-section">
        <div className="feature-card">
          <h3 className="feature-title">Disease Prediction using AI</h3>
          <p className="feature-description">
            Our advanced machine learning models analyze symptoms and predict
            potential diseases with high accuracy.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Dedicated Diabetes Detection</h3>
          <p className="feature-description">
            Use the integrated diabetes model with glucose, BMI, blood pressure,
            age, insulin, and other clinical measurements.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Personalized Health Insights</h3>
          <p className="feature-description">
            Review your prediction results and recommended precautions to
            better understand the health information provided by MEDS-AI.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Verified Home Remedies Suggestions</h3>
          <p className="feature-description">
            Discover expert-reviewed home remedies for common conditions and
            start improving your health naturally.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">User-Friendly Reports</h3>
          <p className="feature-description">
            Receive clear and actionable health reports that help you make
            better health decisions.
          </p>
        </div>
      </section>

      {/* Footer with original blue box */}
      <footer className="homepage-footer">
        <div className="footer-links">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/aboutus">About Us</Link>
            </li>
            <li>
              <a href="#privacy" onClick={handlePrivacyPolicy}>Privacy Policy</a>
            </li>
          </ul>
        </div>
      </footer>

      {/* Learn More Popup */}
      {showLearnMorePopup && (
        <div className="popup-overlay" onClick={() => setShowLearnMorePopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">Learning Complete!</h3>
              <button className="popup-close" onClick={() => setShowLearnMorePopup(false)}>×</button>
            </div>
            <div className="popup-body learn-more-content">
              <div className="congratulations">Congratulations! You've learned more! 🎉</div>
              <p>Your brain has officially expanded by approximately 0.0001%</p>
              <p>Side effects may include: feeling smarter, urge to predict diseases, and sudden interest in AI technologies.</p>
              <img src="https://media.giphy.com/media/d3mlE7uhX8KFgEmY/source.gif" alt="Smart GIF" style={{ width: '80%', borderRadius: '10px', marginTop: '15px' }} />
            </div>
            <div className="popup-footer">
              <button onClick={() => setShowLearnMorePopup(false)}>Close (You're Smarter Now)</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Popup */}
      {showPrivacyPopup && (
        <div className="popup-overlay" onClick={() => setShowPrivacyPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">Privacy Policy</h3>
              <button className="popup-close" onClick={() => setShowPrivacyPopup(false)}>×</button>
            </div>
            <div className="popup-body privacy-content">
              <p>Last Updated: April 3, 2025</p>
              
              <h3>Introduction</h3>
              <p>Welcome to HealthAI. We respect your privacy and are committed to protecting your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our disease prediction service.</p>
              
              <h3>Information We Collect</h3>
              <p>We collect the following types of information:</p>
              <p><strong>Personal Information:</strong> Name, email address, age, gender, and contact details.</p>
              <p><strong>Health Information:</strong> Symptoms, medical history, and other health-related data you provide for prediction purposes.</p>
              <p><strong>Usage Data:</strong> Information about how you interact with our application, including features used and time spent.</p>
              
              <h3>How We Use Your Information</h3>
              <p>We use your information to:</p>
              <p>• Provide accurate disease predictions based on your symptoms</p>
              <p>• Recommend appropriate healthcare professionals</p>
              <p>• Improve our AI models and prediction algorithms</p>
              <p>• Communicate important updates about our service</p>
              <p>• Ensure the security and functionality of our platform</p>
              
              <h3>Data Security</h3>
              <p>We implement strict security measures to protect your personal and health information. This includes encryption, secure servers, regular security audits, and strict access controls for our staff.</p>
              
              <h3>Sharing Your Information</h3>
              <p>We do not sell your personal information. We may share anonymized data with:</p>
              <p>• Healthcare professionals you choose to connect with</p>
              <p>• Research partners (with anonymized data only)</p>
              <p>• Service providers who help us operate our platform</p>
              
              <h3>Your Rights</h3>
              <p>You have the right to:</p>
              <p>• Access your personal information</p>
              <p>• Correct inaccurate information</p>
              <p>• Delete your account and associated data</p>
              <p>• Object to certain processing of your data</p>
              <p>• Export your data in a portable format</p>
              
              <h3>Important Medical Disclaimer</h3>
              <p>The disease predictions provided are for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider regarding any health concerns.</p>
              
              <h3>Contact Us</h3>
              <p>If you have questions about this Privacy Policy, please contact our Data Protection Officer at privacy@healthai.example.com</p>
            </div>
            <div className="popup-footer">
              <button onClick={() => setShowPrivacyPopup(false)}>I Understand</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;