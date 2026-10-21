from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import relationship

from config.db import Base

# Which permissions each role has (many-to-many).
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column(
        "role_name",
        String(50),
        ForeignKey("roles.name", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    ),
    Column(
        "permission_code",
        String(100),
        ForeignKey("permissions.code", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    ),
)


class Permission(Base):
    __tablename__ = "permissions"

    # e.g. "users:read", "products:delete_any"
    code = Column(String(100), primary_key=True)
    description = Column(String(255), nullable=True)


class Role(Base):
    __tablename__ = "roles"

    # e.g. "super_admin", "admin", "user"
    name = Column(String(50), primary_key=True)
    description = Column(String(255), nullable=True)

    permissions = relationship("Permission", secondary=role_permissions, lazy="selectin")

    @property
    def permission_codes(self) -> list[str]:
        return sorted(p.code for p in self.permissions)
