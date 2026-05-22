from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.roadmap_schema import RoadmapGenerateRequest, RoadmapProgressUpdate
from app.services.auth_service import get_current_user
from app.services.roadmap_service import generate_user_roadmap, get_my_roadmap, get_roadmap
from app.services.roadmap_service import get_roadmaps_by_career, list_roadmaps, update_roadmap_progress

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])


@router.get("", response_model=list[dict[str, Any]])
async def read_roadmaps() -> list[dict[str, Any]]:
    return await list_roadmaps()


@router.get("/my-roadmap", response_model=dict[str, Any] | None)
async def my_roadmap(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any] | None:
    return await get_my_roadmap(current_user)


@router.get("/career/{career_id}", response_model=list[dict[str, Any]])
async def roadmaps_for_career(career_id: str) -> list[dict[str, Any]]:
    return await get_roadmaps_by_career(career_id)


@router.get("/{roadmap_id}", response_model=dict[str, Any])
async def read_roadmap(roadmap_id: str) -> dict[str, Any]:
    return await get_roadmap(roadmap_id)


@router.post("/generate", response_model=dict[str, Any], status_code=201)
async def generate_roadmap(
    payload: RoadmapGenerateRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await generate_user_roadmap(current_user, payload.career_path_id)


@router.patch("/progress", response_model=dict[str, Any])
async def patch_roadmap_progress(
    payload: RoadmapProgressUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_roadmap_progress(current_user, payload.model_dump(exclude_unset=True, mode="json"))
