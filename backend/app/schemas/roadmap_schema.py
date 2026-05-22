from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field


class RoadmapGenerateRequest(BaseModel):
    career_path_id: str | None = None


class RoadmapProgressUpdate(BaseModel):
    user_roadmap_id: str | None = None
    phase_id: str
    status: Literal["not_started", "in_progress", "completed"] | None = None
    progress_percentage: float | None = Field(default=None, ge=0, le=100)
    completed_skills: list[str] | None = None


class StudyPlanGenerateRequest(BaseModel):
    roadmap_id: str | None = None
    weekly_available_hours: int = Field(default=8, ge=1, le=80)
    target_completion_date: date | None = None


class StudyPlanTaskUpdate(BaseModel):
    study_plan_id: str
    week_number: int = Field(..., ge=1)
    status: Literal["not_started", "in_progress", "completed"]
    task: str | None = None
    metadata: dict[str, Any] = {}
