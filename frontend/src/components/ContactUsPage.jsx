import React, { useState } from "react";
import { Send, Mail, MapPin } from "lucide-react";

const ContactUsPage = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Message could not be sent.");
      }

      setStatus("sent");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      // Backend endpoint may not exist yet in every deployment;
      // let the visitor know rather than silently failing.
      setStatus("error");
      setError(err.message || "Something went wrong. Please email us directly.");
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-shell">
        {/* Form section */}
        <div className="contact-form-side">
          <h2>Contact us</h2>

          {status === "sent" && (
            <div className="state-banner state-banner--success message-animation" style={{ marginBottom: "1.25rem" }}>
              Thanks — your message has been sent. We'll get back to you soon.
            </div>
          )}

          {status === "error" && (
            <div className="state-banner state-banner--error message-animation" style={{ marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="field-input"
                placeholder="Your name"
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
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="field-textarea"
                rows="4"
                placeholder="How can we help you?"
                required
              />
            </div>

            <button type="submit" disabled={status === "sending"} className="btn btn-solid btn-block">
              <Send size={17} />
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>

        {/* Info section */}
        <div className="contact-info">
          <div>
            <h3>Get in touch</h3>
            <p>Have a question about a prediction, a bug to report, or feedback on the models? Reach out.</p>
          </div>

          <div className="contact-detail-list">
            <div className="contact-detail">
              <span className="contact-detail-icon">
                <Mail size={18} />
              </span>
              <div>
                <p className="contact-detail-label">Email</p>
                <p className="contact-detail-value">thaneeshcsm@gmail.com</p>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-icon">
                <MapPin size={18} />
              </span>
              <div>
                <p className="contact-detail-label">Address</p>
                <p className="contact-detail-value">
                  LakiReddy BaliReddy College of Engineering
                  <br />
                  Mylavaram, Andhra Pradesh, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
