from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database
from app.models.certification_model import create_user_certification_document
from app.services.progress_service import create_progress_log
from app.utils.helpers import build_update_document, utc_now
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def list_certifications() -> list[dict[str, Any]]:
    db = get_database()
    certifications = await db.certifications.find({}).sort("title", 1).to_list(length=None)
    return serialize_documents(certifications)


async def get_certifications_by_career(career_id: str) -> list[dict[str, Any]]:
    db = get_database()
    certifications = await db.certifications.find({"career_path_id": to_object_id(career_id, "career_id")}).sort("title", 1).to_list(length=None)
    return serialize_documents(certifications)


async def get_my_certifications(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    certifications = await db.user_certifications.find({"user_id": current_user["_id"]}).to_list(length=None)
    return serialize_documents(certifications)


async def update_my_certification(current_user: dict[str, Any], certification_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    object_id = to_object_id(certification_id, "certification_id")
    certification = await db.certifications.find_one({"_id": object_id})
    if not certification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certification not found")
    existing = await db.user_certifications.find_one({"user_id": current_user["_id"], "certification_id": object_id})
    now = utc_now()
    if payload.get("status") == "in_progress" and (not existing or not existing.get("started_at")):
        payload["started_at"] = now
    if payload.get("status") == "completed":
        payload["completed_at"] = now
    if existing:
        await db.user_certifications.update_one({"_id": existing["_id"]}, {"$set": build_update_document(payload)})
        saved = await db.user_certifications.find_one({"_id": existing["_id"]})
    else:
        try:
            result = await db.user_certifications.insert_one(
                create_user_certification_document(current_user["_id"], object_id, payload)
            )
        except DuplicateKeyError:
            saved = await db.user_certifications.find_one({"user_id": current_user["_id"], "certification_id": object_id})
        else:
            saved = await db.user_certifications.find_one({"_id": result.inserted_id})
    await create_progress_log(current_user["_id"], "certification.updated", "certification", object_id, f"Updated certification {certification['title']}", None)
    return serialize_document(saved)
