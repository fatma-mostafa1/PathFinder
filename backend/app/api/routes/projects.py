from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.project_schema import UserProjectCreate, UserProjectUpdate
from app.services.auth_service import get_current_user
from app.services.project_service import add_my_project, get_my_projects, get_projects_by_career
from app.services.project_service import list_projects, update_my_project

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[dict[str, Any]])
async def read_projects() -> list[dict[str, Any]]:
    return await list_projects()


@router.get("/career/{career_id}", response_model=list[dict[str, Any]])
async def projects_for_career(career_id: str) -> list[dict[str, Any]]:
    return await get_projects_by_career(career_id)


@router.get("/me", response_model=list[dict[str, Any]])
async def my_projects(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_projects(current_user)


@router.post("/me", response_model=dict[str, Any], status_code=201)
async def add_project(
    payload: UserProjectCreate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await add_my_project(current_user, payload.model_dump(mode="json"))


@router.patch("/me/{project_id}", response_model=dict[str, Any])
async def patch_project(
    project_id: str,
    payload: UserProjectUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_my_project(current_user, project_id, payload.model_dump(exclude_unset=True, mode="json"))
