from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.user_schema import UserUpdate
from app.services.auth_service import get_current_user
from app.services.user_service import get_me, update_me

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=dict[str, Any])
async def read_me(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return await get_me(current_user)


@router.put("/me", response_model=dict[str, Any])
async def update_current_user(
    payload: UserUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_me(current_user, payload.model_dump(exclude_unset=True))
