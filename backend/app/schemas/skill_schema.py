from typing import Literal

from pydantic import BaseModel, Field


class UserSkillCreate(BaseModel):
    skill_id: str
    level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    status: Literal["not_started", "in_progress", "completed"] = "not_started"
    progress_percentage: float = Field(default=0, ge=0, le=100)
    notes: str | None = None


class UserSkillUpdate(BaseModel):
    level: Literal["beginner", "intermediate", "advanced"] | None = None
    status: Literal["not_started", "in_progress", "completed"] | None = None
    progress_percentage: float | None = Field(default=None, ge=0, le=100)
    notes: str | None = None
