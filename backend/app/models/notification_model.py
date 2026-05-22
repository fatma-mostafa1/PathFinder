from typing import Any

from bson import ObjectId

from app.utils.helpers import utc_now

NOTIFICATIONS_COLLECTION = "notifications"


def create_notification_document(
    user_id: ObjectId,
    title: str,
    message: str,
    notification_type: str = "system",
    scheduled_at: Any | None = None,
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "is_read": False,
        "scheduled_at": scheduled_at,
        "created_at": utc_now(),
    }
