import os
import smtplib

from flask import Blueprint, request, jsonify
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/contact", methods=["POST", "OPTIONS"])
def contact():

    # Handle CORS preflight request
    if request.method == "OPTIONS":
        return "", 200

    try:
        # Get submitted form data
        data = request.get_json(silent=True) or {}

        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip()
        message = str(data.get("message", "")).strip()

        # ==============================
        # VALIDATION
        # ==============================

        if not name:
            return jsonify({
                "error": "Name is required."
            }), 400

        if not email:
            return jsonify({
                "error": "Email is required."
            }), 400

        if not message:
            return jsonify({
                "error": "Message is required."
            }), 400

        # ==============================
        # SMTP CONFIGURATION
        # ==============================

        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_from = os.getenv("SMTP_FROM", smtp_user)

        # Check SMTP configuration
        if not smtp_host or not smtp_user or not smtp_password:
            print("SMTP configuration is missing.")

            return jsonify({
                "error": "Email service is not configured."
            }), 500

        # ==============================
        # CREATE EMAIL
        # ==============================

        mail = MIMEMultipart()

        # Your Gmail account
        mail["From"] = smtp_from

        # Receive the contact message
        mail["To"] = smtp_user

        # Visitor's email
        # Clicking Reply will reply directly to the visitor
        mail["Reply-To"] = email

        mail["Subject"] = f"New Contact Message from {name}"

        # ==============================
        # EMAIL BODY
        # ==============================

        body = f"""
PREDET-AI CONTACT FORM
======================

You received a new message through the PREDET-AI Contact Us form.

Name:
{name}

Email:
{email}

Message:
{message}

======================

You can click "Reply" to respond directly to {email}.
"""

        mail.attach(
            MIMEText(body, "plain")
        )

        # ==============================
        # SEND EMAIL THROUGH GMAIL SMTP
        # ==============================

        with smtplib.SMTP(
            smtp_host,
            smtp_port,
            timeout=15
        ) as server:

            # Secure the SMTP connection
            server.starttls()

            # Login using the same credentials
            # used by Forgot Password
            server.login(
                smtp_user,
                smtp_password
            )

            # Send email to your Gmail account
            server.sendmail(
                smtp_from,
                smtp_user,
                mail.as_string()
            )

        # ==============================
        # SUCCESS
        # ==============================

        print("\n========== CONTACT EMAIL SENT ==========")
        print("Name:", name)
        print("Visitor Email:", email)
        print("Sent To:", smtp_user)
        print("========================================\n")

        return jsonify({
            "message": "Message sent successfully."
        }), 200

    except Exception as e:

        print("Contact email error:", str(e))

        return jsonify({
            "error": "Unable to send message. Please try again later."
        }), 500