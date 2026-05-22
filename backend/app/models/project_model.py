from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document

PROJECTS_COLLECTION = "projects"
USER_PROJECTS_COLLECTION = "user_projects"


def create_project_document(payload: dict[str, Any]) -> dict[str, Any]:
    return build_insert_document(
        {
            "title": payload["title"],
            "description": payload.get("description"),
            "career_path_id": payload["career_path_id"],
            "difficulty": payload.get("difficulty", "beginner"),
            "required_skills": payload.get("required_skills", []),
            "tools": payload.get("tools", []),
            "estimated_duration_weeks": payload.get("estimated_duration_weeks", 2),
            "instructions": payload.get("instructions", []),
            "expected_output": payload.get("expected_output"),
            "evaluation_criteria": payload.get("evaluation_criteria", []),
        }
    )


def create_user_project_document(
    user_id: ObjectId,
    project_id: ObjectId,
    payload: dict[str, Any],
) -> dict[str, Any]:
    return build_insert_document(
        {
            "user_id": user_id,
            "project_id": project_id,
            "status": payload.get("status", "not_started"),
            "github_link": payload.get("github_link"),
            "live_demo_link": payload.get("live_demo_link"),
            "notes": payload.get("notes"),
            "started_at": payload.get("started_at"),
            "completed_at": payload.get("completed_at"),
            "progress_percentage": payload.get("progress_percentage", 0),
        }
    )
