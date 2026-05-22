from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database
from app.models.career_model import create_career_path_document
from app.utils.helpers import build_update_document, slugify
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def list_careers(include_inactive: bool = False) -> list[dict[str, Any]]:
    db = get_database()
    query = {} if include_inactive else {"is_active": True}
    careers = await db.career_paths.find(query).sort("title", 1).to_list(length=None)
    return serialize_documents(careers)


async def get_career(career_id: str) -> dict[str, Any]:
    db = get_database()
    career = await db.career_paths.find_one({"_id": to_object_id(career_id, "career_id")})
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career path not found")
    return serialize_document(career)


async def create_career(payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    career_document = create_career_path_document(payload)
    try:
        result = await db.career_paths.insert_one(career_document)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Career slug already exists") from exc
    career = await db.career_paths.find_one({"_id": result.inserted_id})
    return serialize_document(career)


async def update_career(career_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    object_id = to_object_id(career_id, "career_id")
    if "title" in payload and "slug" not in payload:
        payload["slug"] = slugify(payload["title"])
    update_doc = build_update_document(payload)
    try:
        result = await db.career_paths.update_one({"_id": object_id}, {"$set": update_doc})
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Career slug already exists") from exc
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career path not found")
    career = await db.career_paths.find_one({"_id": object_id})
    return serialize_document(career)


async def delete_career(career_id: str) -> dict[str, str]:
    db = get_database()
    result = await db.career_paths.update_one(
        {"_id": to_object_id(career_id, "career_id")},
        {"$set": {"is_active": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career path not found")
    return {"message": "Career path deactivated successfully"}
