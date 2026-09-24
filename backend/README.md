# Brian Flask Backend

MVP REST API for the Brian network and infrastructure topology platform.

## Quick start

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app wsgi run --debug
```

The API starts at `http://localhost:5000`. Health is available at `/health`. Endpoint documentation is in [docs/API.md](docs/API.md), and the machine-readable contract is [openapi.yaml](openapi.yaml).

## Test

```bash
python -m pytest
```

## Configuration

Copy `.env.example` to `.env` and set `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`, `BRIAN_ADMIN_USERNAME`, and `BRIAN_ADMIN_PASSWORD` for local or production environments. PostgreSQL URLs are supported through `DATABASE_URL`.

## Architecture

- `app/__init__.py`: Flask application factory.
- `app/routes/`: versioned API blueprints for devices, topology, scans, agents, integrations, and icons.
- `app/models.py`: SQLAlchemy entities.
- `app/schemas.py`: Marshmallow serialization and validation.
- `app/extensions.py`: Flask extension instances.
- `tests/`: Flask test-client coverage.

The current MVP uses JWT authentication for administrative API calls and SQLite by default. Agent-specific scoped-token authentication and asynchronous parser/sync workers are explicit next steps before production deployment.
