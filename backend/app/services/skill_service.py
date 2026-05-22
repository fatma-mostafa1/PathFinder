from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database
from app.models.skill_model import create_user_skill_document
from app.services.progress_service import create_progress_log
from app.utils.helpers import build_update_document, utc_now
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def list_skills() -> list[dict[str, Any]]:
    db = get_database()
    skills = await db.skills.find({}).sort("name", 1).to_list(length=None)
    return serialize_documents(skills)


async def get_skill(skill_id: str) -> dict[str, Any]:
    db = get_database()
    skill = await db.skills.find_one({"_id": to_object_id(skill_id, "skill_id")})
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return serialize_document(skill)


async def get_my_skills(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    skills = await db.user_skills.find({"user_id": current_user["_id"]}).sort("updated_at", -1).to_list(length=None)
    return serialize_documents(skills)


async def add_my_skill(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    skill_id = to_object_id(payload["skill_id"], "skill_id")
    skill = await db.skills.find_one({"_id": skill_id})
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    now = utc_now()
    if payload.get("status") in {"in_progress", "completed"}:
        payload["started_at"] = now
    if payload.get("status") == "completed":
        payload["completed_at"] = now
        payload["progress_percentage"] = 100
    payload["updated_at"] = now
    user_skill_document = create_user_skill_document(current_user["_id"], skill_id, skill["name"], payload)
    try:
        result = await db.user_skills.insert_one(user_skill_document)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill already added") from exc
    await create_progress_log(current_user["_id"], "skill.added", "skill", skill_id, f"Added skill {skill['name']}", payload.get("progress_percentage", 0))
    saved = await db.user_skills.find_one({"_id": result.inserted_id})
    return serialize_document(saved)


async def update_my_skill(current_user: dict[str, Any], skill_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    object_id = to_object_id(skill_id, "skill_id")
    existing = await db.user_skills.find_one({"user_id": current_user["_id"], "skill_id": object_id})
    if not existing:
        skill = await db.skills.find_one({"_id": object_id})
        if not skill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
        return await add_my_skill(current_user, {"skill_id": skill_id, **payload})

    now = utc_now()
    if payload.get("status") in {"in_progress", "completed"} and not existing.get("started_at"):
        payload["started_at"] = now
    if payload.get("status") == "completed":
        payload["completed_at"] = now
        payload["progress_percentage"] = 100
    update_doc = build_update_document(payload)
    await db.user_skills.update_one({"_id": existing["_id"]}, {"$set": update_doc})
    await create_progress_log(current_user["_id"], "skill.updated", "skill", object_id, f"Updated skill {existing['skill_name']}", update_doc.get("progress_percentage"))
    updated = await db.user_skills.find_one({"_id": existing["_id"]})
    return serialize_document(updated)
