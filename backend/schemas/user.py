from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from typing import List, Optional


# Base properties shared across schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr


# Properties to receive on user creation / registration.
# Public sign-up can never choose a role; new accounts are always "user".
class UserCreate(UserBase):
    # Minimum length mirrors the Flutter client's validation (>= 8 chars).
    password: str = Field(min_length=8, max_length=128)


# Used by admins creating an account from the admin API.
class AdminUserCreate(UserCreate):
    role: str = "user"


# Partial update by an admin.
class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    is_active: Optional[bool] = None


# Signed-in user editing their own profile. Changing the password requires
# the current one. Role / is_active are deliberately not editable here.
class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class RoleAssign(BaseModel):
    role: str


# Properties to receive on login.
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Properties returned in API responses (never includes the password hash).
class UserResponse(UserBase):
    id: int
    created_at: datetime
    role: str
    is_active: bool
    approval_status: str = "approved"
    created_by_email: Optional[str] = None
    permissions: List[str] = []

    model_config = ConfigDict(from_attributes=True)


# Returned by the auth endpoints: the JWT plus the authenticated user.
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RoleResponse(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str]


class RolePermissionsUpdate(BaseModel):
    permissions: List[str]


class PermissionResponse(BaseModel):
    code: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
