"""Import every model so Base.metadata (and Alembic autogenerate) sees them all."""
from models.role import Permission, Role, role_permissions  # noqa: F401
from models.user import User  # noqa: F401
from models.product import Product  # noqa: F401
from models.audit_log import AuditLog  # noqa: F401
