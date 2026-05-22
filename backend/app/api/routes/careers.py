from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.career_schema import CareerPathCreate, CareerPathUpdate
from app.services.auth_service import get_current_user
from app.services.career_service import create_career, delete_career, get_career, list_careers, update_career

router = APIRouter(prefix="/careers", tags=["Careers"])


@router.get("", response_model=list[dict[str, Any]])
async def read_careers() -> list[dict[str, Any]]:
    return await list_careers()


@router.get("/{career_id}", response_model=dict[str, Any])
async def read_career(career_id: str) -> dict[str, Any]:
    return await get_career(career_id)


@router.post("", response_model=dict[str, Any], status_code=201)
async def create_career_path(
    payload: CareerPathCreate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await create_career(payload.model_dump(mode="json"))


@router.put("/{career_id}", response_model=dict[str, Any])
async def update_career_path(
    career_id: str,
    payload: CareerPathUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_career(career_id, payload.model_dump(exclude_unset=True, mode="json"))


@router.delete("/{career_id}", response_model=dict[str, str])
async def remove_career_path(
    career_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    return await delete_career(career_id)
