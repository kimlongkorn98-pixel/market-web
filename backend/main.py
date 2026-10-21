from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

import logging
from pathlib import Path

from alembic.config import Config as AlembicConfig
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory

from config.db import engine
from routes.user import router as user_router
from routes.auth import router as auth_router
from routes.product import router as product_router
from routes.role import router as role_router
from routes.audit import router as audit_router

# The schema is managed by Alembic: run `alembic upgrade head` after pulling
# new code. Warn loudly at startup if the database is behind.
def _warn_if_migrations_pending() -> None:
    cfg = AlembicConfig(str(Path(__file__).with_name("alembic.ini")))
    head = ScriptDirectory.from_config(cfg).get_current_head()
    try:
        with engine.connect() as conn:
            current = MigrationContext.configure(conn).get_current_revision()
    except Exception as exc:  # DB down: let requests surface the error
        logging.getLogger("uvicorn.error").warning("Could not check migrations: %s", exc)
        return
    if current != head:
        logging.getLogger("uvicorn.error").warning(
            "Database is at migration %s but the code expects %s. "
            "Run `alembic upgrade head` in the backend folder.", current, head,
        )

_warn_if_migrations_pending()

app = FastAPI(
    title="MarketHub Backend",
    description="Shared REST API (PostgreSQL) serving both the Flutter mobile app and the Next.js web app.",
    version="1.0.0",
)

# CORS configuration.
# This single backend serves BOTH clients:
#   - market-web  (Next.js)  -> http://localhost:3000
#   - market-app  (Flutter web / desktop) -> http://localhost:PORT
# Add extra origins via the CORS_ORIGINS env var (comma-separated).
_default_origins = [
    "http://localhost:3000",  # Next.js dev server (market-web)
    "http://127.0.0.1:3000",
    "http://localhost:8080",  # common Flutter web dev port
]
_extra = os.getenv("CORS_ORIGINS", "")
_allowed_origins = _default_origins + [
    o.strip() for o in _extra.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(role_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(product_router)

# Basic API health check
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "fastapi-backend"}

if __name__ == "__main__":
    # Start the local development server when run directly
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
