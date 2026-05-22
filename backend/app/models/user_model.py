from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document, utc_now

USERS_COLLECTION = "users"
USER_SETTINGS_COLLECTION = "user_settings"
ACTIVITY_LOGS_COLLECTION = "activity_logs"
USER_ROLES = {"student", "admin"}


def create_user_document(
    full_name: str,
    email: str,
    password_hash: str,
    role: str = "student",
) -> dict[str, Any]:
    return build_insert_document(
        {
            "full_name": full_name,
            "email": email,
            "password_hash": password_hash,
            "role": role if role in USER_ROLES else "student",
            "is_active": True,
            "is_verified": False,
            "last_login": None,
        }
    )


def create_user_settings_document(user_id: ObjectId) -> dict[str, Any]:
    return build_insert_document(
        {
            "user_id": user_id,
            "dark_mode": False,
            "notifications_enabled": True,
            "email_notifications": True,
            "language": "en",
            "privacy_level": "private",
        }
    )


def create_activity_log_document(
    user_id: ObjectId,
    activity_type: str,
    description: str,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "activity_type": activity_type,
        "description": description,
        "metadata": metadata or {},
        "created_at": utc_now(),
    }
