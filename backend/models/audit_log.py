from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, func

from config.db import Base


class AuditLog(Base):
    """Who changed what, and when (role, permission and account changes)."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    # Kept even if the acting user is later deleted (actor_id becomes NULL).
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_email = Column(String(100), nullable=True)
    # e.g. "user.role_changed", "role.permissions_changed"
    action = Column(String(50), nullable=False, index=True)
    # e.g. ("user", "12") or ("role", "editor")
    target_type = Column(String(30), nullable=False)
    target_id = Column(String(100), nullable=False)
    # {"before": ..., "after": ...} or other context
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=func.now(), index=True)
