from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.profile_model import create_profile_document
from app.models.user_model import create_user_settings_document
from app.services.auth_service import public_user
from app.db.mongodb import get_database
from app.utils.helpers import build_update_document
from app.utils.object_id import serialize_document
from app.utils.validators import normalize_email


async def get_me(current_user: dict[str, Any]) -> dict[str, Any]:
    return public_user(current_user)


async def update_me(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    if "email" in payload and payload["email"]:
        payload["email"] = normalize_email(payload["email"])
    update_doc = build_update_document(payload)
    try:
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_doc})
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from exc
    user = await db.users.find_one({"_id": current_user["_id"]})
    return public_user(user)


async def get_profile(current_user: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    profile = await db.user_profiles.find_one({"user_id": current_user["_id"]})
    if not profile:
        result = await db.user_profiles.insert_one(create_profile_document(current_user["_id"], {}))
        profile = await db.user_profiles.find_one({"_id": result.inserted_id})
    return serialize_document(profile)


async def upsert_profile(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    existing = await db.user_profiles.find_one({"user_id": current_user["_id"]})
    if existing:
        await db.user_profiles.update_one(
            {"_id": existing["_id"]},
            {"$set": build_update_document(payload)},
        )
        profile = await db.user_profiles.find_one({"_id": existing["_id"]})
        return serialize_document(profile)

    profile_document = create_profile_document(current_user["_id"], payload)
    result = await db.user_profiles.insert_one(profile_document)
    profile = await db.user_profiles.find_one({"_id": result.inserted_id})
    return serialize_document(profile)


async def get_settings(current_user: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    settings = await db.user_settings.find_one({"user_id": current_user["_id"]})
    if not settings:
        result = await db.user_settings.insert_one(create_user_settings_document(current_user["_id"]))
        settings = await db.user_settings.find_one({"_id": result.inserted_id})
    return serialize_document(settings)
