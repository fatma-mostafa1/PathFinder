from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document

SKILLS_COLLECTION = "skills"
USER_SKILLS_COLLECTION = "user_skills"


def create_skill_document(payload: dict[str, Any]) -> dict[str, Any]:
    return build_insert_document(
        {
            "name": payload["name"],
            "category": payload.get("category", "general"),
            "description": payload.get("description"),
            "difficulty": payload.get("difficulty", "beginner"),
            "related_careers": payload.get("related_careers", []),
            "prerequisites": payload.get("prerequisites", []),
            "recommended_resources": payload.get("recommended_resources", []),
        }
    )


def create_user_skill_document(
    user_id: ObjectId,
    skill_id: ObjectId,
    skill_name: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "skill_id": skill_id,
        "skill_name": skill_name,
        "level": payload.get("level", "beginner"),
        "status": payload.get("status", "not_started"),
        "progress_percentage": payload.get("progress_percentage", 0),
        "started_at": payload.get("started_at"),
        "completed_at": payload.get("completed_at"),
        "notes": payload.get("notes"),
        "updated_at": payload.get("updated_at"),
    }
