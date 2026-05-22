from typing import Any

from bson import ObjectId
from fastapi import HTTPException, status

from app.models.career_model import create_match_document
from app.utils.helpers import clamp
from app.utils.object_id import serialize_document


def _keywords(career: dict[str, Any]) -> set[str]:
    fields = [
        career.get("title", ""),
        career.get("description", ""),
        career.get("overview", ""),
        " ".join(career.get("tags", [])),
        " ".join(career.get("required_skills", [])),
        " ".join(career.get("recommended_tools", [])),
    ]
    return {token.strip().lower() for field in fields for token in str(field).replace("/", " ").split()}


def _overlap_score(values: list[str], keywords: set[str], weight: float) -> float:
    normalized = {item.lower() for item in values}
    if not normalized:
        return 0
    matched = sum(1 for item in normalized if item in keywords or any(item in key for key in keywords))
    return (matched / len(normalized)) * weight


def _programming_score(level: str, difficulty: str) -> float:
    level_rank = {"beginner": 1, "intermediate": 2, "advanced": 3}.get(level, 1)
    difficulty_rank = {"beginner": 1, "intermediate": 2, "advanced": 3}.get(difficulty, 2)
    gap = abs(level_rank - difficulty_rank)
    return max(5, 15 - (gap * 5))


def _weekly_hours_score(hours: int, duration_months: int) -> float:
    if hours >= 12:
        return 10
    if hours >= 8:
        return 8 if duration_months <= 9 else 6
    if hours >= 5:
        return 5
    return 3


def _score_career(career: dict[str, Any], assessment: dict[str, Any]) -> dict[str, Any]:
    keywords = _keywords(career)
    preferred_area = str(assessment.get("preferred_area") or "").lower()
    career_goal = str(assessment.get("career_goal") or "").lower()
    current_skills = assessment.get("current_skills", [])
    favorite_subjects = assessment.get("favorite_subjects", [])

    area_score = 25 if preferred_area and any(preferred_area in key for key in keywords) else 8
    skills_score = _overlap_score(current_skills, keywords, 20)
    subjects_score = _overlap_score(favorite_subjects, keywords, 15)
    programming_score = _programming_score(
        assessment.get("programming_level", "beginner"),
        career.get("difficulty_level", "intermediate"),
    )
    goal_score = 10 if career_goal and any(token in keywords for token in career_goal.split()) else 4
    style_score = 5 if assessment.get("learning_style") in {"project", "mixed"} else 3
    hours_score = _weekly_hours_score(
        int(assessment.get("weekly_hours") or 0),
        int(career.get("average_duration_months") or 6),
    )
    total = round(clamp(area_score + skills_score + subjects_score + programming_score + goal_score + style_score + hours_score), 2)

    matched_skills = [
        skill for skill in current_skills if skill.lower() in keywords or any(skill.lower() in key for key in keywords)
    ]
    missing_skills = [
        skill for skill in career.get("required_skills", []) if skill.lower() not in {item.lower() for item in current_skills}
    ][:5]

    reasons = [
        f"Your preferred area aligns with {career['title']}" if area_score >= 20 else f"{career['title']} still has partial overlap with your interests",
        f"Your programming level is a {assessment.get('programming_level')} fit for this path",
        f"You can invest {assessment.get('weekly_hours')} hours weekly, which supports steady progress",
    ]
    strengths = matched_skills or ["Clear career motivation", "Consistent weekly availability"]
    weaknesses = missing_skills or ["Build deeper proof of work through projects"]
    improvements = [f"Practice {skill}" for skill in missing_skills[:3]] or ["Complete one portfolio project for this path"]

    return {
        "career_path_id": career["_id"],
        "career_title": career["title"],
        "match_percentage": total,
        "reasons": reasons,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommended_improvements": improvements,
    }


async def calculate_and_store_matches(
    db,
    user_id: ObjectId,
    assessment_id: ObjectId,
    assessment: dict[str, Any],
) -> dict[str, Any]:
    careers = await db.career_paths.find({"is_active": True}).to_list(length=None)
    if not careers:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No career paths available")

    matches = sorted(
        [_score_career(career, assessment) for career in careers],
        key=lambda item: item["match_percentage"],
        reverse=True,
    )[:3]
    match_document = create_match_document(user_id, assessment_id, matches)
    result = await db.career_matches.insert_one(match_document)
    saved = await db.career_matches.find_one({"_id": result.inserted_id})
    return serialize_document(saved)
