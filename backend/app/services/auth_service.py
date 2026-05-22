from typing import Any

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.security import create_access_token, decode_access_token, hash_password, oauth2_scheme
from app.core.security import verify_password
from app.db.mongodb import get_database
from app.models.profile_model import create_profile_document
from app.models.user_model import create_activity_log_document, create_user_document
from app.models.user_model import create_user_settings_document
from app.utils.helpers import build_update_document, utc_now
from app.utils.object_id import serialize_document, to_object_id
from app.utils.validators import normalize_email


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    serialized = serialize_document(user) or {}
    serialized["id"] = serialized.get("_id")
    serialized.pop("password_hash", None)
    return serialized


async def register_user(payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    email = normalize_email(payload["email"])
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_document = create_user_document(
        full_name=payload["full_name"].strip(),
        email=email,
        password_hash=hash_password(payload["password"]),
        role=payload.get("role", "student"),
    )

    try:
        result = await db.users.insert_one(user_document)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from exc

    user_id = result.inserted_id
    await db.user_profiles.insert_one(create_profile_document(user_id, {}))
    await db.user_settings.insert_one(create_user_settings_document(user_id))
    await db.activity_logs.insert_one(
        create_activity_log_document(user_id, "auth.register", "User registered")
    )

    created_user = await db.users.find_one({"_id": user_id})
    return public_user(created_user)


async def authenticate_user(email: str, password: str) -> dict[str, Any]:
    db = get_database()
    user = await db.users.find_one({"email": normalize_email(email)})
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": utc_now(), "updated_at": utc_now()}},
    )
    await db.activity_logs.insert_one(
        create_activity_log_document(user["_id"], "auth.login", "User logged in")
    )
    refreshed_user = await db.users.find_one({"_id": user["_id"]})
    token = create_access_token(subject=str(user["_id"]), extra={"role": user.get("role", "student")})
    return {"access_token": token, "token_type": "bearer", "user": public_user(refreshed_user)}


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict[str, Any]:
    db = get_database()
    payload = decode_access_token(token)
    user_id = to_object_id(payload["sub"], "user_id")
    user = await db.users.find_one({"_id": user_id, "is_active": True})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_admin(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def update_user_profile_fields(user_id: ObjectId, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    update_doc = build_update_document(payload)
    await db.users.update_one({"_id": user_id}, {"$set": update_doc})
    user = await db.users.find_one({"_id": user_id})
    return public_user(user)
