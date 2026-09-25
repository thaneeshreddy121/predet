from flask import Flask
from routes.user_routes import user_bp
from routes.admin_routes import admin_bp
from routes.prediction_routes import prediction_bp
from routes.auth_routes import auth_bp
from routes.diabetes_routes import diabetes_bp

def register_routes(app: Flask):
    """Register all routes with the Flask app"""
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(prediction_bp, url_prefix="/prediction")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(diabetes_bp, url_prefix="/diabetes")
