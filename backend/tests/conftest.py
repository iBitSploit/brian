import pytest

from app import TestingConfig, create_app
from app.extensions import db


@pytest.fixture()
def app():
    application = create_app(TestingConfig)
    with application.app_context():
        db.drop_all()
        db.create_all()
    yield application
    with application.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def token(client):
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "change-me"})
    return response.get_json()["access_token"]


@pytest.fixture()
def headers(token):
    return {"Authorization": f"Bearer {token}"}
