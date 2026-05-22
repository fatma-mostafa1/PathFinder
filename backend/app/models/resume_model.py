from typing import Any

from bson import ObjectId

from app.utils.helpers import build_insert_document

RESUMES_COLLECTION = "resumes"


def create_resume_document(user_id: ObjectId, payload: dict[str, Any]) -> dict[str, Any]:
    return build_insert_document(
        {
            "user_id": user_id,
            "full_name": payload.get("full_name"),
            "email": payload.get("email"),
            "phone": payload.get("phone"),
            "linkedin": payload.get("linkedin"),
            "github": payload.get("github"),
            "portfolio": payload.get("portfolio"),
            "summary": payload.get("summary"),
            "education": payload.get("education", []),
            "skills": payload.get("skills", []),
            "projects": payload.get("projects", []),
            "certifications": payload.get("certifications", []),
            "experience": payload.get("experience", []),
            "languages": payload.get("languages", []),
        }
    )
