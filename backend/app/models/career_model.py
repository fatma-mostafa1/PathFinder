from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document, slugify, utc_now

CAREER_PATHS_COLLECTION = "career_paths"
CAREER_ASSESSMENTS_COLLECTION = "career_assessments"
CAREER_MATCHES_COLLECTION = "career_matches"


def create_career_path_document(payload: dict[str, Any]) -> dict[str, Any]:
    return build_insert_document(
        {
            "title": payload["title"],
            "slug": payload.get("slug") or slugify(payload["title"]),
            "description": payload.get("description"),
            "overview": payload.get("overview"),
            "difficulty_level": payload.get("difficulty_level", "intermediate"),
            "average_duration_months": payload.get("average_duration_months", 6),
            "required_skills": payload.get("required_skills", []),
            "recommended_tools": payload.get("recommended_tools", []),
            "responsibilities": payload.get("responsibilities", []),
            "suggested_projects": payload.get("suggested_projects", []),
            "recommended_certifications": payload.get("recommended_certifications", []),
            "market_demand": payload.get("market_demand", "medium"),
            "salary_level": payload.get("salary_level", "medium"),
            "tags": payload.get("tags", []),
            "icon": payload.get("icon"),
            "color": payload.get("color"),
            "is_active": payload.get("is_active", True),
        }
    )


def create_assessment_document(user_id: ObjectId, payload: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    return {
        "user_id": user_id,
        "answers": payload.get("answers", {}),
        "preferred_area": payload.get("preferred_area"),
        "programming_level": payload.get("programming_level"),
        "favorite_subjects": payload.get("favorite_subjects", []),
        "current_skills": payload.get("current_skills", []),
        "career_goal": payload.get("career_goal"),
        "weekly_hours": payload.get("weekly_hours", 0),
        "learning_style": payload.get("learning_style"),
        "completed_at": now,
        "created_at": now,
    }


def create_match_document(
    user_id: ObjectId,
    assessment_id: ObjectId,
    matches: list[dict[str, Any]],
) -> dict[str, Any]:
    best_match = matches[0]["career_path_id"] if matches else None
    return {
        "user_id": user_id,
        "assessment_id": assessment_id,
        "matches": matches,
        "best_match_career_id": best_match,
        "created_at": utc_now(),
    }
