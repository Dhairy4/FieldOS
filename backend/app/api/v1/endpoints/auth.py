"""Auth endpoints — login and register issue JWT tokens."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from app.core.security import create_access_token, decode_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class LoginPayload(BaseModel):
    email: str
    password: str


class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str = "technician"
    languagePreference: str = "english"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginPayload):
    if not payload.email or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": payload.email, "role": "technician"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": "tech-001",
            "name": payload.email.split("@")[0] or "Field Technician",
            "email": payload.email,
            "role": "technician",
            "languagePreference": "english",
        },
    }


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterPayload):
    token = create_access_token({"sub": payload.email, "role": payload.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": "tech-001",
            "name": payload.name,
            "email": payload.email,
            "role": payload.role,
            "languagePreference": payload.languagePreference,
        },
    }


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return {"email": payload.get("sub"), "role": payload.get("role")}
