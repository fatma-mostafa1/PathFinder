from typing import Any

from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user
from app.services.notification_service import delete_notification, list_notifications, mark_notification_read

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[dict[str, Any]])
async def notifications(current_user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    return await list_notifications(current_user)


@router.patch("/{notification_id}/read", response_model=dict[str, Any])
async def read_notification(
    notification_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return await mark_notification_read(current_user, notification_id)


@router.delete("/{notification_id}", response_model=dict[str, str])
async def remove_notification(
    notification_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    return await delete_notification(current_user, notification_id)
