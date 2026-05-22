from typing import Any

from fastapi import HTTPException, status

from app.db.mongodb import get_database
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def list_notifications(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    notifications = await db.notifications.find({"user_id": current_user["_id"]}).sort("created_at", -1).to_list(length=None)
    return serialize_documents(notifications)


async def mark_notification_read(current_user: dict[str, Any], notification_id: str) -> dict[str, Any]:
    db = get_database()
    object_id = to_object_id(notification_id, "notification_id")
    result = await db.notifications.update_one(
        {"_id": object_id, "user_id": current_user["_id"]},
        {"$set": {"is_read": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification = await db.notifications.find_one({"_id": object_id})
    return serialize_document(notification)


async def delete_notification(current_user: dict[str, Any], notification_id: str) -> dict[str, str]:
    db = get_database()
    result = await db.notifications.delete_one(
        {"_id": to_object_id(notification_id, "notification_id"), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Notification deleted successfully"}
