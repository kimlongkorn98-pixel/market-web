"""Test setup: a throwaway SQLite database built with the real Alembic migrations.

Run from the backend folder:  pytest
"""
import itertools
import os
import sys
import tempfile
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

# Must be set before anything imports config.db (load_dotenv won't override it).
_DB_FILE = Path(tempfile.mkdtemp()) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_FILE.as_posix()}"
os.environ["JWT_SECRET_KEY"] = "test-secret"

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402

command.upgrade(Config(str(BACKEND / "alembic.ini")), "head")

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402
from config.db import SessionLocal  # noqa: E402
from models.user import User  # noqa: E402

_ids = itertools.count(1)


@pytest.fixture(scope="session")
def client():
    with TestClient(main.app) as c:
        yield c


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def make_user(client):
    """Register a fresh user with the given role; returns (auth_headers, user_json)."""

    def _make(role: str = "user", name: str | None = None):
        n = next(_ids)
        email = f"user{n}@example.com"
        res = client.post("/api/auth/register", json={
            "name": name or f"Test {role} {n}", "email": email, "password": "Secret123",
        })
        assert res.status_code == 201, res.text
        body = res.json()
        if role != "user":
            # Roles can't be self-assigned through the API, so set it directly.
            session = SessionLocal()
            session.query(User).filter(User.id == body["user"]["id"]).update({"role": role})
            session.commit()
            session.close()
            body["user"]["role"] = role
        return {"Authorization": f"Bearer {body['access_token']}"}, body["user"]

    return _make
