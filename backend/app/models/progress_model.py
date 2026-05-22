from typing import Any

from bson import ObjectId

from app.utils.helpers import utc_now

PROGRESS_LOGS_COLLECTION = "progress_logs"
CAREER_READINESS_SCORES_COLLECTION = "career_readiness_scores"


def create_progress_log_document(
    user_id: ObjectId,
    action_type: str,
    entity_type: str,
    entity_id: ObjectId | None,
    description: str,
    progress_value: float | None = None,
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "action_type": action_type,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "description": description,
        "progress_value": progress_value,
        "created_at": utc_now(),
    }


def create_readiness_score_document(
    user_id: ObjectId,
    career_path_id: ObjectId,
    breakdown: dict[str, float],
    strengths: list[str],
    weaknesses: list[str],
    recommendations: list[str],
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "career_path_id": career_path_id,
        "total_score": breakdown["total_score"],
        "roadmap_score": breakdown["roadmap_score"],
        "skills_score": breakdown["skills_score"],
        "projects_score": breakdown["projects_score"],
        "interview_score": breakdown["interview_score"],
        "portfolio_score": breakdown["portfolio_score"],
        "certification_score": breakdown["certification_score"],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "calculated_at": utc_now(),
    }
