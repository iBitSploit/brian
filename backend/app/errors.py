from typing import Any

from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError


def error_response(message: str, status_code: int, code: str = "request_error", details: Any = None) -> tuple[dict[str, Any], int]:
    payload: dict[str, Any] = {"error": {"code": code, "message": message}}
    if details is not None:
        payload["error"]["details"] = details
    return payload, status_code


def register_error_handlers(app: Any) -> None:
    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError) -> tuple[dict[str, Any], int]:
        return error_response("Request validation failed.", 400, "validation_error", error.messages)

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error: IntegrityError) -> tuple[dict[str, Any], int]:
        app.logger.warning("Database integrity error: %s", error.orig)
        return error_response("The request conflicts with existing data.", 409, "conflict")

    @app.errorhandler(404)
    def handle_not_found(error: Any) -> tuple[dict[str, Any], int]:
        return error_response("The requested resource was not found.", 404, "not_found")

    @app.errorhandler(405)
    def handle_method_not_allowed(error: Any) -> tuple[dict[str, Any], int]:
        return error_response("The HTTP method is not allowed for this resource.", 405, "method_not_allowed")
