from typing import Any

from flask import Flask, jsonify

from .config import Config, TestingConfig
from .errors import register_error_handlers
from .extensions import db, jwt, migrate


def create_app(config_object: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    register_error_handlers(app)

    from .api import api_bp
    from .auth import auth_bp
    from .routes import agent_bp, device_bp, icon_bp, integration_bp, scan_bp, topology_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(device_bp, url_prefix="/api/v1/devices")
    app.register_blueprint(topology_bp, url_prefix="/api/v1/topology")
    app.register_blueprint(scan_bp, url_prefix="/api/v1/scans")
    app.register_blueprint(agent_bp, url_prefix="/api/v1/agents")
    app.register_blueprint(integration_bp, url_prefix="/api/v1/integrations")
    app.register_blueprint(icon_bp, url_prefix="/api/v1/icons")
    app.register_blueprint(api_bp, url_prefix="/api/v1")

    @app.get("/health")
    def health() -> tuple[Any, int]:
        return jsonify({"status": "ok", "service": "brian-api"}), 200

    with app.app_context():
        db.create_all()

    return app


__all__ = ["create_app", "TestingConfig"]
