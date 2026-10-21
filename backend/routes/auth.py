from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.db import get_db
from config.deps import account_block_reason, get_current_user
from config.security import create_access_token, hash_password, verify_password
from controllers.user import UserController
from models.user import User
from schemas.user import ProfileUpdate, UserCreate, UserLogin, TokenResponse, UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return a JWT access token."""
    existing_user = UserController.get_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = UserController.create(db, user_data)
    token = create_access_token(subject=user.id, extra_claims={"email": user.email})
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user by email + password and return a JWT access token."""
    user = UserController.authenticate(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    reason = account_block_reason(user)
    if reason:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason)
    token = create_access_token(subject=user.id, extra_claims={"email": user.email})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Return the signed-in user, including their role and permissions."""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    changes: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Edit your own name and/or password."""
    if changes.new_password is not None:
        if not changes.current_password or not verify_password(
            changes.current_password, current_user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your current password is incorrect.",
            )
        current_user.password_hash = hash_password(changes.new_password)
    if changes.name is not None:
        current_user.name = changes.name.strip()
    db.commit()
    db.refresh(current_user)
    return current_user
