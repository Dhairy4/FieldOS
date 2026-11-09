"""Auth endpoints — DB-backed login/register with hashed passwords.

Users are persisted in the ``users`` table with bcrypt hashes. JWTs carry the
user id in ``sub`` plus role/email claims for convenience. Every protected
endpoint resolves the caller from the database via :func:`get_current_user`.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

ALLOWED_ROLES = {"technician", "supervisor", "admin"}


class LoginPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()


class RegisterPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "technician"
    languagePreference: str = Field(default="english", max_length=32)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if "@" not in v or v.startswith("@") or v.endswith("@"):
            raise ValueError("A valid email address is required")
        return v.lower()

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in ALLOWED_ROLES:
            raise ValueError(f"role must be one of {sorted(ALLOWED_ROLES)}")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def _user_public(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "languagePreference": user.language_preference,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


def _issue_token(user: User) -> str:
    return create_access_token(
        {"sub": user.id, "email": user.email, "role": user.role}
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This account is disabled"
        )
    return {
        "access_token": _issue_token(user),
        "token_type": "bearer",
        "user": _user_public(user),
    }


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        id=f"user-{uuid.uuid4().hex[:12]}",
        email=payload.email,
        name=payload.name,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        language_preference=payload.languagePreference,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": _issue_token(user),
        "token_type": "bearer",
        "user": _user_public(user),
    }


def _resolve_user(db: Session, payload: dict) -> Optional[User]:
    sub = payload.get("sub")
    if sub:
        user = db.get(User, sub)
        if user:
            return user
        # Backwards compatibility: older tokens used the email as ``sub``.
        if isinstance(sub, str) and "@" in sub:
            user = db.query(User).filter(User.email == sub.lower()).first()
            if user:
                return user
    email = payload.get("email")
    if isinstance(email, str) and email:
        return db.query(User).filter(User.email == email.lower()).first()
    return None


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> dict:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = _resolve_user(db, payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This account is disabled"
        )
    return _user_public(user)
