from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.progress_schema import ReadinessCalculateRequest
from app.services.auth_service import get_current_user
from app.services.readiness_service import calculate_readiness, get_my_readiness

router = APIRouter(prefix="/readiness", tags=["Career Readiness"])


@router.get("/me", response_model=dict[str, Any] | None)
async def my_readiness(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any] | None:
    return await get_my_readiness(current_user)


@router.post("/calculate", response_model=dict[str, Any], status_code=201)
async def calculate(
    payload: ReadinessCalculateRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await calculate_readiness(current_user, payload.career_path_id)
