from pydantic import BaseModel


class ProgressSummary(BaseModel):
    roadmap_progress: float
    skills_progress: float
    projects_progress: float
    certifications_progress: float
    interview_progress: float


class ReadinessCalculateRequest(BaseModel):
    career_path_id: str | None = None
