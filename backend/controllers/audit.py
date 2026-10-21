from typing import Any, Optional

from sqlalchemy.orm import Session

from models.audit_log import AuditLog
from models.user import User


class AuditController:
    @staticmethod
    def record(
        db: Session,
        actor: User,
        action: str,
        target_type: str,
        target_id: Any,
        details: Optional[dict] = None,
    ) -> None:
        """Add an audit entry to the session.

        It is committed together with the change it describes, so a failed
        change never leaves a misleading log line behind.
        """
        db.add(AuditLog(
            actor_id=actor.id,
            actor_email=actor.email,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            details=details,
        ))

    @staticmethod
    def list(
        db: Session,
        limit: int = 50,
        offset: int = 0,
        action: Optional[str] = None,
    ):
        query = db.query(AuditLog)
        if action:
            query = query.filter(AuditLog.action == action)
        return query.order_by(AuditLog.id.desc()).offset(offset).limit(limit).all()
