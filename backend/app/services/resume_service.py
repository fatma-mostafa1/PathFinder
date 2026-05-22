from typing import Any

from app.db.mongodb import get_database
from app.models.resume_model import create_resume_document
from app.utils.helpers import build_update_document
from app.utils.object_id import serialize_document


async def get_my_resume(current_user: dict[str, Any]) -> dict[str, Any] | None:
    db = get_database()
    resume = await db.resumes.find_one({"user_id": current_user["_id"]})
    return serialize_document(resume)


async def create_resume(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    existing = await db.resumes.find_one({"user_id": current_user["_id"]})
    if existing:
        return await update_resume(current_user, payload)
    result = await db.resumes.insert_one(create_resume_document(current_user["_id"], payload))
    resume = await db.resumes.find_one({"_id": result.inserted_id})
    return serialize_document(resume)


async def update_resume(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    existing = await db.resumes.find_one({"user_id": current_user["_id"]})
    if not existing:
        return await create_resume(current_user, payload)
    await db.resumes.update_one({"_id": existing["_id"]}, {"$set": build_update_document(payload)})
    resume = await db.resumes.find_one({"_id": existing["_id"]})
    return serialize_document(resume)
