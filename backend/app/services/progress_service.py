from typing import Any

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.progress_model import create_progress_log_document
from app.utils.helpers import percentage
from app.utils.object_id import serialize_documents


async def create_progress_log(
    user_id: ObjectId,
    action_type: str,
    entity_type: str,
    entity_id: ObjectId | None,
    description: str,
    progress_value: float | None = None,
) -> None:
    db = get_database()
    await db.progress_logs.insert_one(
        create_progress_log_document(
            user_id,
            action_type,
            entity_type,
            entity_id,
            description,
            progress_value,
        )
    )


async def get_progress_summary(current_user: dict[str, Any]) -> dict[str, float]:
    db = get_database()
    user_id = current_user["_id"]
    user_roadmap = await db.user_roadmaps.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    skills = await db.user_skills.find({"user_id": user_id}).to_list(length=None)
    projects = await db.user_projects.find({"user_id": user_id}).to_list(length=None)
    certifications = await db.user_certifications.find({"user_id": user_id}).to_list(length=None)
    interviews = await db.user_interview_progress.find({"user_id": user_id}).to_list(length=None)

    skills_progress = round(sum(skill.get("progress_percentage", 0) for skill in skills) / len(skills), 2) if skills else 0
    projects_progress = round(sum(project.get("progress_percentage", 0) for project in projects) / len(projects), 2) if projects else 0
    certifications_progress = percentage(
        sum(1 for certification in certifications if certification.get("status") == "completed"),
        len(certifications),
    )
    interview_progress = percentage(
        sum(1 for interview in interviews if interview.get("status") in {"practiced", "mastered"}),
        len(interviews),
    )
    return {
        "roadmap_progress": user_roadmap.get("overall_progress", 0) if user_roadmap else 0,
        "skills_progress": skills_progress,
        "projects_progress": projects_progress,
        "certifications_progress": certifications_progress,
        "interview_progress": interview_progress,
    }


async def get_progress_logs(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    logs = await db.progress_logs.find({"user_id": current_user["_id"]}).sort("created_at", -1).to_list(length=100)
    return serialize_documents(logs)
