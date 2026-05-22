from typing import Any

from bson import ObjectId

from app.utils.helpers import utc_now

INTERVIEW_QUESTIONS_COLLECTION = "interview_questions"
USER_INTERVIEW_PROGRESS_COLLECTION = "user_interview_progress"


def create_interview_question_document(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "career_path_id": payload["career_path_id"],
        "question": payload["question"],
        "answer": payload.get("answer"),
        "type": payload.get("type", "technical"),
        "difficulty": payload.get("difficulty", "beginner"),
        "related_skill": payload.get("related_skill"),
        "created_at": utc_now(),
    }


def create_user_interview_progress_document(
    user_id: ObjectId,
    question_id: ObjectId,
    payload: dict[str, Any],
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "question_id": question_id,
        "status": payload.get("status", "not_started"),
        "user_answer": payload.get("user_answer"),
        "notes": payload.get("notes"),
        "last_practiced_at": payload.get("last_practiced_at"),
    }
