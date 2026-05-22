from typing import Any

from app.db.mongodb import get_database
from app.models.career_model import create_assessment_document
from app.services.matching_service import calculate_and_store_matches
from app.utils.object_id import serialize_document, serialize_documents


async def submit_assessment(current_user: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    db = get_database()
    assessment_document = create_assessment_document(current_user["_id"], payload)
    result = await db.career_assessments.insert_one(assessment_document)
    assessment = await db.career_assessments.find_one({"_id": result.inserted_id})
    matches = await calculate_and_store_matches(db, current_user["_id"], result.inserted_id, assessment)
    return {"assessment": serialize_document(assessment), "matches": matches}


async def get_my_assessments(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    assessments = await db.career_assessments.find({"user_id": current_user["_id"]}).sort("created_at", -1).to_list(length=None)
    return serialize_documents(assessments)


async def get_my_matches(current_user: dict[str, Any]) -> list[dict[str, Any]]:
    db = get_database()
    matches = await db.career_matches.find({"user_id": current_user["_id"]}).sort("created_at", -1).to_list(length=None)
    return serialize_documents(matches)
