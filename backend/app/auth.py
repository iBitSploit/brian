import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from .errors import error_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login() -> tuple[dict, int]:
    payload = request.get_json(silent=True) or {}
    username = payload.get("username")
    password = payload.get("password")
    expected_username = os.getenv("BRIAN_ADMIN_USERNAME", "admin")
    expected_password = os.getenv("BRIAN_ADMIN_PASSWORD", "change-me")
    if username != expected_username or password != expected_password:
        return error_response("Invalid credentials.", 401, "invalid_credentials")
    return jsonify({"access_token": create_access_token(identity=username), "token_type": "Bearer"}), 200
