from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document

ROADMAPS_COLLECTION = "roadmaps"
USER_ROADMAPS_COLLECTION = "user_roadmaps"
LEARNING_RESOURCES_COLLECTION = "learning_resources"
STUDY_PLANS_COLLECTION = "study_plans"


def create_roadmap_document(payload: dict[str, Any]) -> dict[str, Any]:
    return build_insert_document(
        {
            "career_path_id": payload["career_path_id"],
            "title": payload["title"],
            "description": payload.get("description"),
            "total_estimated_weeks": payload.get("total_estimated_weeks", 24),
            "phases": payload.get("phases", []),
        }
    )


def create_user_roadmap_document(
    user_id: ObjectId,
    roadmap: dict[str, Any],
    career_path_id: ObjectId,
) -> dict[str, Any]:
    phases_progress = [
        {
            "phase_id": phase["phase_id"],
            "status": "not_started",
            "progress_percentage": 0,
            "completed_skills": [],
            "started_at": None,
            "completed_at": None,
        }
        for phase in roadmap.get("phases", [])
    ]
    return build_insert_document(
        {
            "user_id": user_id,
            "roadmap_id": roadmap["_id"],
            "career_path_id": career_path_id,
            "status": "not_started",
            "started_at": None,
            "completed_at": None,
            "overall_progress": 0,
            "phases_progress": phases_progress,
            "current_phase_id": phases_progress[0]["phase_id"] if phases_progress else None,
        }
    )


def create_study_plan_document(
    user_id: ObjectId,
    roadmap_id: ObjectId,
    weekly_available_hours: int,
    target_completion_date: Any,
    schedule: list[dict[str, Any]],
) -> dict[str, Any]:
    return build_insert_document(
        {
            "user_id": user_id,
            "roadmap_id": roadmap_id,
            "weekly_available_hours": weekly_available_hours,
            "target_completion_date": target_completion_date,
            "schedule": schedule,
        }
    )
