from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserCreate
from config.security import hash_password, verify_password
from config.permissions import ApprovalStatus, Roles


class UserController:
    @staticmethod
    def get_all(db: Session):
        """Fetch all users from the database."""
        return db.query(User).order_by(User.id.asc()).all()

    @staticmethod
    def get_by_id(db: Session, user_id: int):
        """Fetch a specific user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str):
        """Fetch a user by email address (for uniqueness checks & login)."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(
        db: Session,
        user_data: UserCreate,
        role: str = Roles.USER,
        approval_status: str = ApprovalStatus.APPROVED,
        created_by_id: int | None = None,
    ):
        """Insert a new user record, storing a bcrypt hash of the password."""
        db_user = User(
            name=user_data.name,
            email=str(user_data.email).lower(),
            password_hash=hash_password(user_data.password),
            role=role,
            approval_status=approval_status,
            created_by_id=created_by_id,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate(db: Session, email: str, password: str):
        """Return the user if the email exists and the password matches, else None."""
        user = UserController.get_by_email(db, str(email).lower())
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def delete(db: Session, user_id: int):
        """Remove a user record by ID."""
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db.delete(db_user)
            db.commit()
        return db_user
