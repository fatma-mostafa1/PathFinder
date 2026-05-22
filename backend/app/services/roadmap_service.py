from datetime import date
from typing import Any

from fastapi import HTTPException, status

from app.db.mongodb import get_database
from app.models.roadmap_model import create_study_plan_document, create_user_roadmap_document
from app.services.progress_service import create_progress_log
from app.utils.helpers import build_update_document, utc_now
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def list_roadmaps() -> list[dict[str, Any]]:
    db = get_database()
    roadmaps = await db.roadmaps.find({}).sort("title", 1).to_list(length=None)
    return serialize_documents(roadmaps)


async def get_roadmap(roadmap_id: str) -> dict[str, Any]:
    db = get_database()
    roadmap = await db.roadmaps.find_one({"_id": to_object_id(roadmap_id, "roadmap_id")})
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
    return serialize_document(roadmap)


async def get_roadmaps_by_career(career_id: str) -> list[dict[str, Any]]:
    db = get_database()
    roadmaps = await db.roadmaps.find({"career_path_id": to_object_id(career_id, "career_id")}).to_list(length=None)
    return serialize_documents(roadmaps)


async def _career_id_from_latest_match(user_id) -> Any:
    db = get_database()
    latest_match = await db.career_matches.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if latest_match and latest_match.get("best_match_career_id"):
        return latest_match["best_match_career_id"]
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Submit an assessment or provide career_path_id first",
    )


async def generate_user_roadmap(current_user: dict[str, Any], career_path_id: str | None = None) -> dict[str, Any]:
    db = get_database()
    career_object_id = to_object_id(career_path_id, "career_path_id") if career_path_id else await _career_id_from_latest_match(current_user["_id"])
    roadmap = await db.roadmaps.find_one({"career_path_id": career_object_id})
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No roadmap template found for this career")

    existing = await db.user_roadmaps.find_one(
        {"user_id": current_user["_id"], "career_path_id": career_object_id},
        sort=[("created_at", -1)],
    )
    if existing:
        return serialize_document(existing)

    user_roadmap_document = create_user_roadmap_document(current_user["_id"], roadmap, career_object_id)
    result = await db.user_roadmaps.insert_one(user_roadmap_document)
    await create_progress_log(
        current_user["_id"],
        "roadmap.generated",
        "user_roadmap",
        result.inserted_id,
        "Generated personalized roadmap",
        0,
    )
    saved = await db.user_roadmaps.find_one({"_id": result.inserted_id})
    return serialize_document(saved)


async def get_my_roadmap(current_user: dict[str, Any]) -> dict[str, Any] | None:
    db = get_database()
    user_roadmap = await db.user_roadmaps.find_one({"user_id": current_user["_id"]}, sort=[("created_at", -1)])
    return serialize_document(user_roadmap)


async def update_roadmap_progress(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    query = {"user_id": current_user["_id"]}
    if payload.get("user_roadmap_id"):
        query["_id"] = to_object_id(payload["user_roadmap_id"], "user_roadmap_id")

    user_roadmap = await db.user_roadmaps.find_one(query, sort=[("created_at", -1)])
    if not user_roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User roadmap not found")

    phase_found = False
    now = utc_now()
    for phase in user_roadmap.get("phases_progress", []):
        if phase.get("phase_id") == payload["phase_id"]:
            phase_found = True
            if payload.get("status"):
                phase["status"] = payload["status"]
            if payload.get("progress_percentage") is not None:
                phase["progress_percentage"] = payload["progress_percentage"]
            if payload.get("completed_skills") is not None:
                phase["completed_skills"] = payload["completed_skills"]
            if phase["status"] == "in_progress" and not phase.get("started_at"):
                phase["started_at"] = now
            if phase["status"] == "completed" or phase.get("progress_percentage") == 100:
                phase["status"] = "completed"
                phase["progress_percentage"] = 100
                phase["completed_at"] = phase.get("completed_at") or now
            break

    if not phase_found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap phase not found")

    phases = user_roadmap.get("phases_progress", [])
    overall_progress = round(sum(phase.get("progress_percentage", 0) for phase in phases) / len(phases), 2) if phases else 0
    current_phase = next((phase["phase_id"] for phase in phases if phase.get("status") != "completed"), None)
    status_value = "completed" if overall_progress == 100 else "in_progress"
    update_doc = build_update_document(
        {
            "phases_progress": phases,
            "overall_progress": overall_progress,
            "current_phase_id": current_phase,
            "status": status_value,
            "started_at": user_roadmap.get("started_at") or now,
            "completed_at": now if status_value == "completed" else user_roadmap.get("completed_at"),
        }
    )
    await db.user_roadmaps.update_one({"_id": user_roadmap["_id"]}, {"$set": update_doc})
    await create_progress_log(
        current_user["_id"],
        "roadmap.progress_updated",
        "user_roadmap",
        user_roadmap["_id"],
        f"Updated roadmap phase {payload['phase_id']}",
        overall_progress,
    )
    updated = await db.user_roadmaps.find_one({"_id": user_roadmap["_id"]})
    return serialize_document(updated)


async def generate_study_plan(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    roadmap_id = to_object_id(payload["roadmap_id"], "roadmap_id") if payload.get("roadmap_id") else None
    user_roadmap_query = {"user_id": current_user["_id"]}
    if roadmap_id:
        user_roadmap_query["roadmap_id"] = roadmap_id
    user_roadmap = await db.user_roadmaps.find_one(user_roadmap_query, sort=[("created_at", -1)])
    if not user_roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generate a roadmap before creating a study plan")

    roadmap = await db.roadmaps.find_one({"_id": user_roadmap["roadmap_id"]})
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap template not found")

    schedule: list[dict[str, Any]] = []
    week_number = 1
    for phase in roadmap.get("phases", []):
        estimated_weeks = max(1, int(phase.get("estimated_weeks") or 1))
        tasks = [
            f"Study {skill}" for skill in phase.get("skills", [])
        ] + [
            f"Build project: {project}" for project in phase.get("projects", [])
        ] + [
            f"Review resource: {resource}" for resource in phase.get("resources", [])
        ]
        for index in range(estimated_weeks):
            schedule.append(
                {
                    "week_number": week_number,
                    "title": phase["title"] if index == 0 else f"{phase['title']} practice",
                    "tasks": tasks,
                    "estimated_hours": payload["weekly_available_hours"],
                    "status": "not_started",
                }
            )
            week_number += 1

    target_completion_date = payload.get("target_completion_date")
    if isinstance(target_completion_date, date):
        target_completion_date = target_completion_date.isoformat()
    study_plan_document = create_study_plan_document(
        current_user["_id"],
        user_roadmap["roadmap_id"],
        payload["weekly_available_hours"],
        target_completion_date,
        schedule,
    )
    result = await db.study_plans.insert_one(study_plan_document)
    saved = await db.study_plans.find_one({"_id": result.inserted_id})
    return serialize_document(saved)


async def get_my_study_plans(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    plans = await db.study_plans.find({"user_id": current_user["_id"]}).sort("created_at", -1).to_list(length=None)
    return serialize_documents(plans)


async def update_study_plan_task(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    study_plan_id = to_object_id(payload["study_plan_id"], "study_plan_id")
    plan = await db.study_plans.find_one({"_id": study_plan_id, "user_id": current_user["_id"]})
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study plan not found")

    week_found = False
    for week in plan.get("schedule", []):
        if week["week_number"] == payload["week_number"]:
            week_found = True
            week["status"] = payload["status"]
            if payload.get("task") and payload["task"] not in week.get("tasks", []):
                week.setdefault("tasks", []).append(payload["task"])
            break
    if not week_found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study plan week not found")

    await db.study_plans.update_one(
        {"_id": study_plan_id},
        {"$set": {"schedule": plan["schedule"], "updated_at": utc_now()}},
    )
    updated = await db.study_plans.find_one({"_id": study_plan_id})
    return serialize_document(updated)
