from typing import Any

from fastapi import APIRouter, Depends

from app.schemas.certification_schema import UserCertificationUpdate
from app.services.auth_service import get_current_user
from app.services.certification_service import get_certifications_by_career, get_my_certifications
from app.services.certification_service import list_certifications, update_my_certification

router = APIRouter(prefix="/certifications", tags=["Certifications"])


@router.get("", response_model=list[dict[str, Any]])
async def read_certifications() -> list[dict[str, Any]]:
    return await list_certifications()


@router.get("/career/{career_id}", response_model=list[dict[str, Any]])
async def certifications_for_career(career_id: str) -> list[dict[str, Any]]:
    return await get_certifications_by_career(career_id)


@router.get("/me", response_model=list[dict[str, Any]])
async def my_certifications(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await get_my_certifications(current_user)


@router.patch("/me/{certification_id}", response_model=dict[str, Any])
async def patch_certification(
    certification_id: str,
    payload: UserCertificationUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await update_my_certification(current_user, certification_id, payload.model_dump(exclude_unset=True, mode="json"))
