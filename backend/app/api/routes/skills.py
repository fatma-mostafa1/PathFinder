from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.skill_schema import UserSkillCreate, UserSkillUpdate
from app.services.auth_service import get_current_user
from app.services.skill_service import add_my_skill, get_my_skills, get_skill, list_skills, update_my_skill

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=list[dict[str, Any]])
async def read_skills() -> list[dict[str, Any]]:
    return await list_skills()


@router.get("/me", response_model=list[dict[str, Any]])
async def my_skills(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_skills(current_user)


@router.get("/{skill_id}", response_model=dict[str, Any])
async def read_skill(skill_id: str) -> dict[str, Any]:
    return await get_skill(skill_id)


@router.post("/me", response_model=dict[str, Any], status_code=201)
async def add_skill(
    payload: UserSkillCreate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await add_my_skill(current_user, payload.model_dump(mode="json"))


@router.patch("/me/{skill_id}", response_model=dict[str, Any])
async def patch_skill(
    skill_id: str,
    payload: UserSkillUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_my_skill(current_user, skill_id, payload.model_dump(exclude_unset=True, mode="json"))
