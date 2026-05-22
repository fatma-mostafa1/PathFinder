from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.interview_schema import InterviewProgressUpdate
from app.services.auth_service import get_current_user
from app.services.interview_service import get_my_interview_progress, get_questions_by_career
from app.services.interview_service import update_interview_progress

router = APIRouter(prefix="/interviews", tags=["Interview Preparation"])


@router.get("/questions/{career_id}", response_model=list[dict[str, Any]])
async def questions(career_id: str) -> list[dict[str, Any]]:
    return await get_questions_by_career(career_id)


@router.get("/progress/me", response_model=list[dict[str, Any]])
async def my_progress(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_interview_progress(current_user)


@router.patch("/progress/{question_id}", response_model=dict[str, Any])
async def patch_progress(
    question_id: str,
    payload: InterviewProgressUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_interview_progress(current_user, question_id, payload.model_dump(exclude_unset=True, mode="json"))
