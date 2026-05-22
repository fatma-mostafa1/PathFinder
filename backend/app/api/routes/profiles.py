from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.profile_schema import ProfileUpsert
from app.services.auth_service import get_current_user
from app.services.user_service import get_profile, upsert_profile

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=dict[str, Any])
async def read_profile(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return await get_profile(current_user)


@router.put("/me", response_model=dict[str, Any])
async def update_profile(
    payload: ProfileUpsert,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await upsert_profile(current_user, payload.model_dump(exclude_unset=True, mode="json"))
