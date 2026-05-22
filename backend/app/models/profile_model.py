from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document

USER_PROFILES_COLLECTION = "user_profiles"


def create_profile_document(user_id: ObjectId, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = payload or {}
    return build_insert_document(
        {
            "user_id": user_id,
            "university": data.get("university"),
            "college": data.get("college"),
            "academic_year": data.get("academic_year"),
            "major": data.get("major"),
            "gpa": data.get("gpa"),
            "country": data.get("country"),
            "city": data.get("city"),
            "bio": data.get("bio"),
            "avatar_url": data.get("avatar_url"),
            "github_url": data.get("github_url"),
            "linkedin_url": data.get("linkedin_url"),
            "portfolio_url": data.get("portfolio_url"),
            "preferred_language": data.get("preferred_language", "en"),
            "weekly_available_hours": data.get("weekly_available_hours", 8),
            "preferred_learning_style": data.get("preferred_learning_style", "mixed"),
            "career_goal": data.get("career_goal"),
        }
    )
