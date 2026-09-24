from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

api_bp = Blueprint("api", __name__)


@api_bp.get("/stats")
@jwt_required()
def stats() -> tuple[dict, int]:
    return jsonify({"devices": 0, "connections": 0, "agents": 0, "scans": 0}), 200


@api_bp.get("/openapi.json")
def openapi() -> tuple[dict, int]:
    return jsonify({"openapi": "3.0.3", "info": {"title": "Brian API", "version": "1.0.0"}, "paths": {}}), 200
