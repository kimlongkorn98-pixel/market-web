from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func, true
from sqlalchemy.orm import relationship

from config.db import Base
from config.permissions import ApprovalStatus, Roles

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    # Stores a bcrypt hash of the user's password (never the plaintext).
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Every user has exactly one role; new sign-ups are plain "user"s.
    role = Column(
        String(50),
        ForeignKey("roles.name", onupdate="CASCADE"),
        nullable=False,
        default=Roles.USER,
        server_default=Roles.USER,
        index=True,
    )
    # Admins can disable an account instead of deleting it.
    is_active = Column(Boolean, nullable=False, default=True, server_default=true())
    # Accounts created by an admin start "pending" and can't sign in until a
    # super admin approves them. Self sign-ups and existing users are "approved".
    approval_status = Column(
        String(20),
        nullable=False,
        default=ApprovalStatus.APPROVED,
        server_default=ApprovalStatus.APPROVED,
        index=True,
    )
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    role_info = relationship("Role", lazy="joined")
    created_by = relationship("User", remote_side=[id], lazy="select")

    @property
    def permissions(self) -> list[str]:
        return self.role_info.permission_codes if self.role_info else []

    @property
    def created_by_email(self) -> str | None:
        return self.created_by.email if self.created_by else None

    def has_permission(self, code: str) -> bool:
        # Super admins can always do everything, even if a permission is
        # added later and not yet granted to the role.
        return self.role == Roles.SUPER_ADMIN or code in self.permissions
