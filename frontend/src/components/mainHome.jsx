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

      {/* Hero */}
      <section className="hero-section">
        <div>
          <h2 className="hero-title">Read your symptoms like a vital sign</h2>
          <p className="hero-description">
            PREDET-AI turns the symptoms and clinical measurements you enter
            into a clear, evidence-based prediction — so you know what to ask
            a doctor before you ever sit down with one.
          </p>
          <div className="cta-buttons">
            <Link to="/predict"><button className="cta-btn">Predict a disease</button></Link>
            <Link to="/diabetes"><button className="cta-btn">Check for diabetes</button></Link>
            <button className="cta-btn" onClick={handleLearnMore}>Learn more</button>
          </div>
        </div>
        <svg className="vitals-waveform" viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 90 L70 90 L90 40 L110 130 L130 20 L150 90 L200 90 L215 70 L230 90 L420 90" />
        </svg>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="feature-card">
          <h3 className="feature-title">Disease prediction</h3>
          <p className="feature-description">
            Enter your symptoms and PREDET-AI's models weigh them against known
            patterns to surface the conditions most likely to explain them.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Diabetes detector</h3>
          <p className="feature-description">
            A dedicated model built on glucose, BMI, blood pressure, age,
            insulin, and other clinical measurements you provide.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Personalized insights</h3>
          <p className="feature-description">
            Every result comes with plain-language precautions, so the
            output is something you can actually act on.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Home remedy suggestions</h3>
          <p className="feature-description">
            Reviewed home-care suggestions for common conditions, to try
            alongside — not instead of — medical advice.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">A record you can return to</h3>
          <p className="feature-description">
            Past predictions are saved to your account, so you can track
            changes over time and share them with a clinician.
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
              <h3 className="popup-title">How MEDS-AI works</h3>
              <button className="popup-close" onClick={() => setShowLearnMorePopup(false)}>×</button>
            </div>
            <div className="popup-body learn-more-content">
              <p><strong>1. You enter your symptoms or measurements.</strong> Disease prediction takes a set of symptoms; the diabetes detector takes clinical values like glucose, BMI, and blood pressure.</p>
              <p><strong>2. Our models compare them against known patterns.</strong> Each model was trained on labeled medical data to weigh which conditions best fit the inputs you give.</p>
              <p><strong>3. You get a result and next steps.</strong> Predictions come with plain-language precautions and home-care suggestions — a starting point for a conversation with a doctor, not a diagnosis.</p>
            </div>
            <div className="popup-footer">
              <button onClick={() => setShowLearnMorePopup(false)}>Close</button>
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
              <p>Last Updated: September 26, 2026</p>
              
              <h3>Introduction</h3>
              <p>Welcome to PREDET-AI. We respect your privacy and are committed to protecting your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our disease prediction service.</p>
              
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
              <p>If you have questions about this Privacy Policy, please contact our Data Protection Officer at privacy@predetai.example.com</p>
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