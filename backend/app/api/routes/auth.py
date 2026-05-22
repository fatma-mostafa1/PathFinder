from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.auth_schema import AuthMessage, LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import authenticate_user, get_current_user, public_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict[str, Any], status_code=201)
async def register(payload: RegisterRequest) -> dict[str, Any]:
    user = await register_user(payload.model_dump())
    return {"message": "Registration successful", "user": user}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> dict[str, Any]:
    return await authenticate_user(str(payload.email), payload.password)


@router.get("/me", response_model=dict[str, Any])
async def me(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return public_user(current_user)


@router.post("/logout", response_model=AuthMessage)
async def logout() -> dict[str, Any]:
    return {"success": True, "message": "Logout successful. Remove the token on the client."}
