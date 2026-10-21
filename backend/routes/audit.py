from datetime import datetime
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from config.db import get_db
from config.deps import require_permission
from config.permissions import Perm
from controllers.audit import AuditController
from models.user import User

router = APIRouter(prefix="/audit-logs", tags=["Audit log (admin)"])


class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_email: Optional[str] = None
    action: str
    target_type: str
    target_id: str
    details: Optional[Any] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[AuditLogResponse])
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission(Perm.AUDIT_READ)),
):
    """Newest first. Filter with e.g. `?action=user.role_changed`."""
    return AuditController.list(db, limit=limit, offset=offset, action=action)
