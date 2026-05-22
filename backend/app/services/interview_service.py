from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database
from app.models.interview_model import create_user_interview_progress_document
from app.services.progress_service import create_progress_log
from app.utils.helpers import build_update_document, utc_now
from app.utils.object_id import serialize_document, serialize_documents, to_object_id


async def get_questions_by_career(career_id: str) -> list[dict[str, Any]]:
    db = get_database()
    questions = await db.interview_questions.find({"career_path_id": to_object_id(career_id, "career_id")}).to_list(length=None)
    return serialize_documents(questions)


async def get_my_interview_progress(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    progress = await db.user_interview_progress.find({"user_id": current_user["_id"]}).sort("last_practiced_at", -1).to_list(length=None)
    return serialize_documents(progress)


async def update_interview_progress(current_user: dict[str, Any], question_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    object_id = to_object_id(question_id, "question_id")
    question = await db.interview_questions.find_one({"_id": object_id})
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview question not found")
    payload["last_practiced_at"] = utc_now()
    existing = await db.user_interview_progress.find_one({"user_id": current_user["_id"], "question_id": object_id})
    if existing:
        await db.user_interview_progress.update_one({"_id": existing["_id"]}, {"$set": build_update_document(payload)})
        saved = await db.user_interview_progress.find_one({"_id": existing["_id"]})
    else:
        try:
            result = await db.user_interview_progress.insert_one(
                create_user_interview_progress_document(current_user["_id"], object_id, payload)
            )
        except DuplicateKeyError:
            existing = await db.user_interview_progress.find_one({"user_id": current_user["_id"], "question_id": object_id})
            await db.user_interview_progress.update_one({"_id": existing["_id"]}, {"$set": build_update_document(payload)})
            result = None
        saved = await db.user_interview_progress.find_one({"_id": result.inserted_id}) if result else await db.user_interview_progress.find_one({"user_id": current_user["_id"], "question_id": object_id})
    await create_progress_log(current_user["_id"], "interview.practiced", "interview_question", object_id, "Updated interview preparation", None)
    return serialize_document(saved)
