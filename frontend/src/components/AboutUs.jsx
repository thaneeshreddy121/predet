import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-inner">
          <p className="about-hero-eyebrow">PREDET-AI • Who we are</p>
          <h1>AI-powered health, one step ahead</h1>
          <p>
            PREDET-AI turns symptoms and clinical measurements into a clear,
            evidence-based starting point — so you know what to ask a doctor
            before you ever sit down with one.
          </p>
        </div>
      </section>

      <div className="about-body">
        <div className="about-card">
          <span className="about-card-kicker">Our story</span>
          <h2>Built by students, aimed at real care</h2>
          <p>
            PREDET-AI is revolutionizing healthcare with AI-driven disease
            prediction. By analyzing symptoms in real time, it connects users
            to accurate, evidence-backed predictions and the right next
            step — faster, smarter, and more precise than ever before.
          </p>
        </div>

        <div className="about-card about-card--span-5 about-card--accent">
          <h2>Our mission</h2>
          <p>
            To make an informed first read on your symptoms accessible to
            everyone, and to turn that read into a clear conversation with a
            real clinician — not a replacement for one.
          </p>
        </div>

        <div className="about-card about-card--span-5">
          <span className="about-card-kicker">Our team</span>
          <h2>The people behind PREDET-AI</h2>
          <ul className="about-team-list">
            <li><strong>Navya Sree Sriramula</strong> — Engineering</li>
            <li><strong>Jahnavi Nagula</strong> — Engineering</li>
            <li><strong>Stanly Jones Nallamothu</strong> — Engineering</li>
            <li><strong>Venkata Thaneesh Reddy Venna</strong> — Engineering</li>
            <li>Guided by <strong>Dr. Sivanagaraju.V</strong></li>
          </ul>
        </div>

        <div className="about-card">
          <span className="about-card-kicker">Our values</span>
          <h2>What we build toward</h2>
          <div className="about-values-grid">
            <div className="about-value-chip">
              <span className="about-value-dot" />
              Innovation in everything
            </div>
            <div className="about-value-chip">
              <span className="about-value-dot" />
              Integrity in relationships
            </div>
            <div className="about-value-chip">
              <span className="about-value-dot" />
              Impact through solutions
            </div>
            <div className="about-value-chip">
              <span className="about-value-dot" />
              Inclusivity in community
            </div>
          </div>
        </div>

        <div className="about-cta">
          <h2>Get in touch</h2>
          <p>We'd love to hear from you. Let's start a conversation.</p>
          <Link to="/contact" className="btn btn-primary">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
