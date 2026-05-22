from typing import Any

from bson import ObjectId

from app.utils.helpers import utc_now

CERTIFICATIONS_COLLECTION = "certifications"
USER_CERTIFICATIONS_COLLECTION = "user_certifications"


def create_certification_document(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "title": payload["title"],
        "provider": payload.get("provider"),
        "career_path_id": payload["career_path_id"],
        "description": payload.get("description"),
        "difficulty": payload.get("difficulty", "beginner"),
        "url": payload.get("url"),
        "estimated_duration": payload.get("estimated_duration"),
        "cost_type": payload.get("cost_type", "free"),
        "created_at": utc_now(),
    }


def create_user_certification_document(
    user_id: ObjectId,
    certification_id: ObjectId,
    payload: dict[str, Any],
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "certification_id": certification_id,
        "status": payload.get("status", "planned"),
        "certificate_url": payload.get("certificate_url"),
        "started_at": payload.get("started_at"),
        "completed_at": payload.get("completed_at"),
        "notes": payload.get("notes"),
    }
