import os
from pathlib import Path


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "development-secret-change-in-production-32")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "development-jwt-secret-change-in-production-32")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{Path(__file__).resolve().parent.parent / 'brian.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    API_TITLE = "Brian API"
    API_VERSION = "v1"


class TestingConfig(Config):
    TESTING = True
    JWT_SECRET_KEY = "test-jwt-secret-change-in-tests-32"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
