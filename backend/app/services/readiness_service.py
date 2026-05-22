from typing import Any

from bson import ObjectId
from fastapi import HTTPException, status

from app.db.mongodb import get_database
from app.models.progress_model import create_readiness_score_document
from app.utils.helpers import percentage
from app.utils.object_id import serialize_document, to_object_id


def _component_status(value: float, label: str) -> tuple[list[str], list[str], list[str]]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[str] = []
    if value >= 70:
        strengths.append(f"{label} is in strong shape")
    elif value < 40:
        weaknesses.append(f"{label} needs focused work")
        recommendations.append(f"Prioritize improving {label.lower()}")
    else:
        recommendations.append(f"Keep building momentum in {label.lower()}")
    return strengths, weaknesses, recommendations


async def _resolve_career_id(db, current_user: dict[str, Any], career_path_id: str | None) -> ObjectId:
    if career_path_id:
        return to_object_id(career_path_id, "career_path_id")
    roadmap = await db.user_roadmaps.find_one({"user_id": current_user["_id"]}, sort=[("created_at", -1)])
    if roadmap:
        return roadmap["career_path_id"]
    match = await db.career_matches.find_one({"user_id": current_user["_id"]}, sort=[("created_at", -1)])
    if match and match.get("best_match_career_id"):
        return match["best_match_career_id"]
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No career path selected")


async def get_my_readiness(current_user: dict[str, Any]) -> dict[str, Any] | None:
    db = get_database()
    score = await db.career_readiness_scores.find_one({"user_id": current_user["_id"]}, sort=[("calculated_at", -1)])
    return serialize_document(score)


async def calculate_readiness(current_user: dict[str, Any], career_path_id: str | None = None) -> dict[str, Any]:
    db = get_database()
    user_id = current_user["_id"]
    career_id = await _resolve_career_id(db, current_user, career_path_id)

    roadmap = await db.user_roadmaps.find_one({"user_id": user_id, "career_path_id": career_id}, sort=[("created_at", -1)])
    roadmap_raw = roadmap.get("overall_progress", 0) if roadmap else 0
    roadmap_score = round(roadmap_raw * 0.30, 2)

    career = await db.career_paths.find_one({"_id": career_id})
    required_skill_names = {skill.lower() for skill in career.get("required_skills", [])} if career else set()
    user_skills = await db.user_skills.find({"user_id": user_id}).to_list(length=None)
    relevant_skills = [
        skill for skill in user_skills if not required_skill_names or skill.get("skill_name", "").lower() in required_skill_names
    ]
    skills_raw = round(sum(skill.get("progress_percentage", 0) for skill in relevant_skills) / len(relevant_skills), 2) if relevant_skills else 0
    skills_score = round(skills_raw * 0.25, 2)

    career_projects = await db.projects.find({"career_path_id": career_id}).to_list(length=None)
    project_ids = {project["_id"] for project in career_projects}
    user_projects = await db.user_projects.find({"user_id": user_id}).to_list(length=None)
    relevant_projects = [project for project in user_projects if project.get("project_id") in project_ids]
    projects_raw = round(sum(project.get("progress_percentage", 0) for project in relevant_projects) / len(relevant_projects), 2) if relevant_projects else 0
    projects_score = round(projects_raw * 0.20, 2)

    questions = await db.interview_questions.find({"career_path_id": career_id}).to_list(length=None)
    question_ids = {question["_id"] for question in questions}
    interview_progress = await db.user_interview_progress.find({"user_id": user_id}).to_list(length=None)
    relevant_interviews = [item for item in interview_progress if item.get("question_id") in question_ids]
    interview_raw = percentage(
        sum(1 for item in relevant_interviews if item.get("status") in {"practiced", "mastered"}),
        len(relevant_interviews) or len(question_ids),
    )
    interview_score = round(interview_raw * 0.10, 2)

    certifications = await db.certifications.find({"career_path_id": career_id}).to_list(length=None)
    certification_ids = {certification["_id"] for certification in certifications}
    user_certifications = await db.user_certifications.find({"user_id": user_id}).to_list(length=None)
    relevant_certifications = [item for item in user_certifications if item.get("certification_id") in certification_ids]
    certifications_raw = percentage(
        sum(1 for item in relevant_certifications if item.get("status") == "completed"),
        len(relevant_certifications) or len(certification_ids),
    )
    certification_score = round(certifications_raw * 0.10, 2)

    profile = await db.user_profiles.find_one({"user_id": user_id}) or {}
    resume = await db.resumes.find_one({"user_id": user_id}) or {}
    portfolio_signals = [
        bool(profile.get("github_url") or resume.get("github")),
        bool(profile.get("linkedin_url") or resume.get("linkedin")),
        bool(profile.get("portfolio_url") or resume.get("portfolio")),
        bool(resume.get("projects")),
    ]
    portfolio_raw = percentage(sum(1 for signal in portfolio_signals if signal), len(portfolio_signals))
    portfolio_score = round(portfolio_raw * 0.05, 2)

    total_score = round(
        roadmap_score + skills_score + projects_score + interview_score + certification_score + portfolio_score,
        2,
    )
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[str] = []
    for raw_value, label in [
        (roadmap_raw, "Roadmap completion"),
        (skills_raw, "Skills coverage"),
        (projects_raw, "Project portfolio"),
        (interview_raw, "Interview preparation"),
        (certifications_raw, "Certifications"),
        (portfolio_raw, "Portfolio readiness"),
    ]:
        component_strengths, component_weaknesses, component_recommendations = _component_status(raw_value, label)
        strengths.extend(component_strengths)
        weaknesses.extend(component_weaknesses)
        recommendations.extend(component_recommendations)

    document = create_readiness_score_document(
        user_id,
        career_id,
        {
            "total_score": total_score,
            "roadmap_score": roadmap_score,
            "skills_score": skills_score,
            "projects_score": projects_score,
            "interview_score": interview_score,
            "portfolio_score": portfolio_score,
            "certification_score": certification_score,
        },
        strengths,
        weaknesses,
        recommendations,
    )
    result = await db.career_readiness_scores.insert_one(document)
    saved = await db.career_readiness_scores.find_one({"_id": result.inserted_id})
    return serialize_document(saved)
