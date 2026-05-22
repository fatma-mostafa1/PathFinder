from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database
from app.models.project_model import create_user_project_document
from app.services.progress_service import create_progress_log
from app.utils.helpers import build_update_document, utc_now
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def list_projects() -> list[dict[str, Any]]:
    db = get_database()
    projects = await db.projects.find({}).sort("title", 1).to_list(length=None)
    return serialize_documents(projects)


async def get_projects_by_career(career_id: str) -> list[dict[str, Any]]:
    db = get_database()
    projects = await db.projects.find({"career_path_id": to_object_id(career_id, "career_id")}).sort("title", 1).to_list(length=None)
    return serialize_documents(projects)


async def get_my_projects(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    projects = await db.user_projects.find({"user_id": current_user["_id"]}).sort("updated_at", -1).to_list(length=None)
    return serialize_documents(projects)


async def add_my_project(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    project_id = to_object_id(payload["project_id"], "project_id")
    project = await db.projects.find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    now = utc_now()
    if payload.get("status") in {"in_progress", "completed"}:
        payload["started_at"] = now
    if payload.get("status") == "completed":
        payload["completed_at"] = now
        payload["progress_percentage"] = 100
    try:
        result = await db.user_projects.insert_one(
            create_user_project_document(current_user["_id"], project_id, payload)
        )
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Project already added") from exc
    await create_progress_log(current_user["_id"], "project.added", "project", project_id, f"Added project {project['title']}", payload.get("progress_percentage", 0))
    saved = await db.user_projects.find_one({"_id": result.inserted_id})
    return serialize_document(saved)


async def update_my_project(current_user: dict[str, Any], project_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    object_id = to_object_id(project_id, "project_id")
    existing = await db.user_projects.find_one({"user_id": current_user["_id"], "project_id": object_id})
    if not existing:
        project = await db.projects.find_one({"_id": object_id})
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return await add_my_project(current_user, {"project_id": project_id, **payload})

    now = utc_now()
    if payload.get("status") in {"in_progress", "completed"} and not existing.get("started_at"):
        payload["started_at"] = now
    if payload.get("status") == "completed":
        payload["completed_at"] = now
        payload["progress_percentage"] = 100
    update_doc = build_update_document(payload)
    await db.user_projects.update_one({"_id": existing["_id"]}, {"$set": update_doc})
    await create_progress_log(current_user["_id"], "project.updated", "project", object_id, "Updated project progress", update_doc.get("progress_percentage"))
    updated = await db.user_projects.find_one({"_id": existing["_id"]})
    return serialize_document(updated)
