from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.resume_schema import ResumeUpsert
from app.services.auth_service import get_current_user
from app.services.resume_service import create_resume, get_my_resume, update_resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.get("/me", response_model=dict[str, Any] | None)
async def my_resume(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any] | None:
    return await get_my_resume(current_user)


@router.post("", response_model=dict[str, Any], status_code=201)
async def create_my_resume(
    payload: ResumeUpsert,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await create_resume(current_user, payload.model_dump(mode="json"))


@router.put("/me", response_model=dict[str, Any])
async def update_my_resume(
    payload: ResumeUpsert,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_resume(current_user, payload.model_dump(mode="json"))
