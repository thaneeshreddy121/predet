from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId

import jwt
import datetime
import os
import secrets
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from database import mongo
from flask_cors import CORS


# ============================================================
# BLUEPRINT
# ============================================================

auth_bp = Blueprint("auth", __name__)

CORS(auth_bp)


# ============================================================
# SECRET KEY
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your_secret_key"
)


# ============================================================
# EMAIL VALIDATION
# ============================================================

def validate_email(email):
    """Basic email validation."""

    return (
        isinstance(email, str)
        and "@" in email
        and "." in email.split("@")[1]
    )


# ============================================================
# SEND PASSWORD RESET OTP
# ============================================================

def send_reset_otp_email(
    email,
    otp
):
    """
    Send password reset OTP through SMTP.

    SMTP configuration is read from environment variables:

        SMTP_HOST
        SMTP_PORT
        SMTP_USER
        SMTP_PASSWORD
        SMTP_FROM

    If SMTP is not configured, the function returns False.
    """

    smtp_host = os.getenv(
        "SMTP_HOST"
    )

    smtp_port = int(
        os.getenv(
            "SMTP_PORT",
            "587"
        )
    )

    smtp_user = os.getenv(
        "SMTP_USER"
    )

    smtp_password = os.getenv(
        "SMTP_PASSWORD"
    )

    smtp_from = os.getenv(
        "SMTP_FROM",
        smtp_user
    )

    # SMTP not configured
    if not smtp_host or not smtp_user or not smtp_password:
        return False

    try:

        message = MIMEMultipart()

        message["From"] = smtp_from
        message["To"] = email
        message["Subject"] = "MEDS-AI Password Reset OTP"

        body = f"""
Hello,

You requested to reset your PREDET-AI password.

Your OTP is:

{otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
PREDET-AI Team
"""

        message.attach(
            MIMEText(
                body,
                "plain"
            )
        )

        with smtplib.SMTP(
            smtp_host,
            smtp_port,
            timeout=15
        ) as server:

            server.starttls()

            server.login(
                smtp_user,
                smtp_password
            )

            server.sendmail(
                smtp_from,
                email,
                message.as_string()
            )

        return True

    except Exception as e:

        print(
            "Email sending failed:",
            e
        )

        return False


# ============================================================
# TEST ROUTE
# ============================================================

@auth_bp.route(
    "/test",
    methods=["GET"]
)
def test():

    return jsonify({
        "message": "Auth blueprint is working!"
    }), 200


# ============================================================
# REGISTER
# ============================================================

@auth_bp.route(
    "/register",
    methods=["POST"]
)
def register():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data provided"
            }), 400

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        required_fields = [
            "name",
            "email",
            "password",
            "gender",
            "age",
            "address",
            "contact_no"
        ]

        for field in required_fields:

            if not data.get(field):

                return jsonify({
                    "error":
                        f"Missing required field: {field}"
                }), 400

        # ----------------------------------------------------
        # Email
        # ----------------------------------------------------

        email = (
            str(data["email"])
            .lower()
            .strip()
        )

        if not validate_email(email):

            return jsonify({
                "error": "Invalid email format"
            }), 400

        # ----------------------------------------------------
        # Password
        # ----------------------------------------------------

        password = str(
            data["password"]
        )

        if len(password) < 6:

            return jsonify({
                "error":
                    "Password must be at least 6 characters long"
            }), 400

        # ----------------------------------------------------
        # Age
        # ----------------------------------------------------

        try:

            age = int(
                data["age"]
            )

            if age < 1 or age > 120:

                return jsonify({
                    "error": "Invalid age"
                }), 400

        except (ValueError, TypeError):

            return jsonify({
                "error":
                    "Age must be a number"
            }), 400

        # ----------------------------------------------------
        # Check existing user
        # ----------------------------------------------------

        existing_user = (
            mongo.db.users.find_one({
                "email": email
            })
        )

        if existing_user:

            return jsonify({
                "error":
                    "Email already exists"
            }), 409

        # ----------------------------------------------------
        # Hash password
        # ----------------------------------------------------

        hashed_password = (
            generate_password_hash(
                password,
                method="pbkdf2:sha256"
            )
        )

        # ----------------------------------------------------
        # User document
        # ----------------------------------------------------

        user_data = {

            "name":
                str(data["name"]).strip(),

            "email":
                email,

            "password":
                hashed_password,

            "gender":
                str(
                    data["gender"]
                ).lower().strip(),

            "age":
                age,

            "address":
                str(
                    data["address"]
                ).strip(),

            "contact_no":
                str(
                    data["contact_no"]
                ).strip(),

            "created_at":
                datetime.datetime.utcnow(),

            "updated_at":
                datetime.datetime.utcnow()
        }

        # ----------------------------------------------------
        # Insert
        # ----------------------------------------------------

        result = (
            mongo.db.users.insert_one(
                user_data
            )
        )

        return jsonify({

            "message":
                "User registered successfully!",

            "user_id":
                str(result.inserted_id)

        }), 201

    except Exception as e:

        current_app.logger.error(
            f"Registration error: {str(e)}"
        )

        return jsonify({
            "error":
                "An error occurred during registration"
        }), 500


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data provided"
            }), 400

        email = (
            str(
                data.get(
                    "email",
                    ""
                )
            )
            .lower()
            .strip()
        )

        password = data.get(
            "password",
            ""
        )

        if not email or not password:

            return jsonify({
                "error":
                    "Email and password are required"
            }), 400

        # ----------------------------------------------------
        # Find user
        # ----------------------------------------------------

        user = mongo.db.users.find_one({
            "email": email
        })

        if not user:

            return jsonify({
                "error":
                    "Invalid email or password"
            }), 401

        # ----------------------------------------------------
        # Check password
        # ----------------------------------------------------

        if not check_password_hash(
            user["password"],
            password
        ):

            return jsonify({
                "error":
                    "Invalid email or password"
            }), 401

        # ----------------------------------------------------
        # JWT
        # ----------------------------------------------------

        token_payload = {

            "user_id":
                str(user["_id"]),

            "email":
                user["email"],

            "exp":
                datetime.datetime.utcnow()
                + datetime.timedelta(
                    hours=24
                )
        }

        token = jwt.encode(
            token_payload,
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({

            "token":
                token,

            "user": {

                "id":
                    str(user["_id"]),

                "name":
                    user["name"],

                "email":
                    user["email"]
            },

            "message":
                "Login successful!"

        }), 200

    except Exception as e:

        current_app.logger.error(
            f"Login error: {str(e)}"
        )

        return jsonify({
            "error":
                "An error occurred during login"
        }), 500


# ============================================================
# FORGOT PASSWORD - SEND OTP
# ============================================================

@auth_bp.route(
    "/forgot-password",
    methods=["POST"]
)
def forgot_password():

    try:

        data = request.get_json() or {}

        email = (
            str(
                data.get(
                    "email",
                    ""
                )
            )
            .lower()
            .strip()
        )

        # ----------------------------------------------------
        # Validate email
        # ----------------------------------------------------

        if not email:

            return jsonify({
                "error":
                    "Email address is required"
            }), 400

        if not validate_email(email):

            return jsonify({
                "error":
                    "Please enter a valid email address"
            }), 400

        # ----------------------------------------------------
        # Find user
        # ----------------------------------------------------

        user = mongo.db.users.find_one({
            "email": email
        })

        if not user:

            return jsonify({
                "error":
                    "No account found with this email address"
            }), 404

        # ----------------------------------------------------
        # Generate 6-digit OTP
        # ----------------------------------------------------

        otp = str(
            secrets.randbelow(
                900000
            ) + 100000
        )

        # ----------------------------------------------------
        # Expiry = 10 minutes
        # ----------------------------------------------------

        expires_at = (
            datetime.datetime.utcnow()
            + datetime.timedelta(
                minutes=10
            )
        )

        # ----------------------------------------------------
        # Save OTP
        # ----------------------------------------------------

        mongo.db.password_resets.update_one(

            {
                "user_id":
                    user["_id"]
            },

            {
                "$set": {

                    "user_id":
                        user["_id"],

                    "email":
                        email,

                    "otp":
                        otp,

                    "expires_at":
                        expires_at,

                    "verified":
                        False,

                    "created_at":
                        datetime.datetime.utcnow()
                }
            },

            upsert=True
        )

        # ----------------------------------------------------
        # Try sending email
        # ----------------------------------------------------

        email_sent = send_reset_otp_email(
            email,
            otp
        )

        # ----------------------------------------------------
        # Development mode
        #
        # If SMTP isn't configured, return OTP so the
        # feature can still be tested locally.
        # ----------------------------------------------------

        response = {

            "message":
                "Password reset OTP generated successfully.",

            "email_sent":
                email_sent
        }

        if not email_sent:

            response["development_mode"] = True

            response["dev_otp"] = otp

            response["message"] = (
                "OTP generated. "
                "Email service is not configured, "
                "so the OTP is shown for local testing."
            )

            print(
                f"[PASSWORD RESET] Development OTP "
                f"for {email}: {otp}"
            )

        return jsonify(
            response
        ), 200

    except Exception as e:

        current_app.logger.exception(
            "Forgot password error"
        )

        return jsonify({
            "error":
                "Unable to process password reset request"
        }), 500


# ============================================================
# RESET PASSWORD
# ============================================================

@auth_bp.route(
    "/reset-password",
    methods=["POST"]
)
def reset_password():

    try:

        data = request.get_json() or {}

        email = (
            str(
                data.get(
                    "email",
                    ""
                )
            )
            .lower()
            .strip()
        )

        otp = str(
            data.get(
                "otp",
                ""
            )
        ).strip()

        new_password = data.get(
            "new_password",
            ""
        )

        # ----------------------------------------------------
        # Validate fields
        # ----------------------------------------------------

        if not email:

            return jsonify({
                "error":
                    "Email address is required"
            }), 400

        if not otp:

            return jsonify({
                "error":
                    "OTP is required"
            }), 400

        if not new_password:

            return jsonify({
                "error":
                    "New password is required"
            }), 400

        if len(new_password) < 6:

            return jsonify({
                "error":
                    "Password must be at least 6 characters long"
            }), 400

        # ----------------------------------------------------
        # Find reset record
        # ----------------------------------------------------

        reset_record = (
            mongo.db.password_resets.find_one({
                "email": email
            })
        )

        if not reset_record:

            return jsonify({
                "error":
                    "No password reset request found"
            }), 400

        # ----------------------------------------------------
        # Check expiry
        # ----------------------------------------------------

        expires_at = reset_record.get(
            "expires_at"
        )

        if not expires_at:

            return jsonify({
                "error":
                    "Invalid password reset request"
            }), 400

        if (
            datetime.datetime.utcnow()
            > expires_at
        ):

            mongo.db.password_resets.delete_one({
                "_id":
                    reset_record["_id"]
            })

            return jsonify({
                "error":
                    "OTP has expired. Please request a new OTP."
            }), 400

        # ----------------------------------------------------
        # Check OTP
        # ----------------------------------------------------

        if str(
            reset_record.get("otp")
        ) != otp:

            return jsonify({
                "error":
                    "Invalid OTP"
            }), 400

        # ----------------------------------------------------
        # Find user
        # ----------------------------------------------------

        user = mongo.db.users.find_one({
            "email": email
        })

        if not user:

            return jsonify({
                "error":
                    "User account not found"
            }), 404

        # ----------------------------------------------------
        # Hash new password
        # ----------------------------------------------------

        hashed_password = (
            generate_password_hash(
                new_password,
                method="pbkdf2:sha256"
            )
        )

        # ----------------------------------------------------
        # Update password
        # ----------------------------------------------------

        mongo.db.users.update_one(

            {
                "_id":
                    user["_id"]
            },

            {
                "$set": {

                    "password":
                        hashed_password,

                    "updated_at":
                        datetime.datetime.utcnow()
                }
            }
        )

        # ----------------------------------------------------
        # Delete used OTP
        # ----------------------------------------------------

        mongo.db.password_resets.delete_one({
            "_id":
                reset_record["_id"]
        })

        return jsonify({

            "message":
                "Password reset successfully. "
                "You can now log in with your new password."

        }), 200

    except Exception as e:

        current_app.logger.exception(
            "Reset password error"
        )

        return jsonify({
            "error":
                "Unable to reset password"
        }), 500


# ============================================================
# VERIFY TOKEN
# ============================================================

@auth_bp.route(
    "/verify-token",
    methods=["GET"]
)
def verify_token():

    try:

        auth_header = request.headers.get(
            "Authorization"
        )

        if (
            not auth_header
            or not auth_header.startswith(
                "Bearer "
            )
        ):

            return jsonify({
                "error":
                    "No token provided"
            }), 401

        token = auth_header.split(
            " ",
            1
        )[1]

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user = mongo.db.users.find_one({
            "_id":
                ObjectId(
                    payload["user_id"]
                )
        })

        if not user:

            return jsonify({
                "error":
                    "User not found"
            }), 401

        return jsonify({

            "valid":
                True,

            "user": {

                "id":
                    str(user["_id"]),

                "email":
                    user["email"],

                "name":
                    user["name"]
            }

        }), 200

    except jwt.ExpiredSignatureError:

        return jsonify({
            "error":
                "Token has expired"
        }), 401

    except jwt.InvalidTokenError:

        return jsonify({
            "error":
                "Invalid token"
        }), 401

    except Exception as e:

        current_app.logger.error(
            f"Token verification error: {str(e)}"
        )

        return jsonify({
            "error":
                "An error occurred during token verification"
        }), 500