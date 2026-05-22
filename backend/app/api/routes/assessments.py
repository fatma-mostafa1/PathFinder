from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.career_schema import AssessmentSubmit
from app.services.assessment_service import get_my_assessments, get_my_matches, submit_assessment
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/assessments", tags=["Assessments"])
matches_router = APIRouter(prefix="/matches", tags=["Career Matches"])


@router.post("/submit", response_model=dict[str, Any], status_code=201)
async def submit(
    payload: AssessmentSubmit,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await submit_assessment(current_user, payload.model_dump(mode="json"))


@router.get("/me", response_model=list[dict[str, Any]])
async def my_assessments(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_assessments(current_user)


@matches_router.get("/me", response_model=list[dict[str, Any]])
async def my_matches(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_matches(current_user)
