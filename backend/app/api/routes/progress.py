from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.roadmap_schema import StudyPlanGenerateRequest, StudyPlanTaskUpdate
from app.services.auth_service import get_current_user
from app.services.progress_service import get_progress_logs, get_progress_summary
from app.services.roadmap_service import generate_study_plan, get_my_study_plans, update_study_plan_task

router = APIRouter(prefix="/progress", tags=["Progress"])
study_plans_router = APIRouter(prefix="/study-plans", tags=["Study Planner"])


@router.get("/summary", response_model=dict[str, float])
async def progress_summary(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, float]:
    return await get_progress_summary(current_user)


@router.get("/logs", response_model=list[dict[str, Any]])
async def progress_logs(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_progress_logs(current_user)


@study_plans_router.post("/generate", response_model=dict[str, Any], status_code=201)
async def create_study_plan(
    payload: StudyPlanGenerateRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await generate_study_plan(current_user, payload.model_dump(exclude_unset=True, mode="json"))


@study_plans_router.get("/me", response_model=list[dict[str, Any]])
async def my_study_plans(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_study_plans(current_user)


@study_plans_router.patch("/task", response_model=dict[str, Any])
async def patch_study_plan_task(
    payload: StudyPlanTaskUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_study_plan_task(current_user, payload.model_dump(exclude_unset=True, mode="json"))
