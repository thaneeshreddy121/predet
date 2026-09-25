from flask import Blueprint, jsonify


admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/test", methods=["GET"])
def admin_test():
    return jsonify({
        "message": "Admin API is running"
    }), 200