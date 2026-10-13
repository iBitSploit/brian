"""Database session configuration for integration persistence.

DATABASE_URL must point at Brian's PostgreSQL database. The integration tables use
their own metadata until they are merged into the project's central ORM metadata.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def make_session_factory():
    url=os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL must be configured to use persisted integrations")
    engine=create_engine(url, pool_pre_ping=True, future=True)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
