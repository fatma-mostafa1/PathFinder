from typing import Any, Literal

from pydantic import BaseModel, Field


class CareerPathCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    slug: str | None = None
    description: str | None = None
    overview: str | None = None
    difficulty_level: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    average_duration_months: int = Field(default=6, ge=1, le=48)
    required_skills: list[str] = []
    recommended_tools: list[str] = []
    responsibilities: list[str] = []
    suggested_projects: list[str] = []
    recommended_certifications: list[str] = []
    market_demand: Literal["low", "medium", "high", "very_high"] = "high"
    salary_level: Literal["low", "medium", "high", "very_high"] = "high"
    tags: list[str] = []
    icon: str | None = None
    color: str | None = None
    is_active: bool = True


class CareerPathUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=120)
    slug: str | None = None
    description: str | None = None
    overview: str | None = None
    difficulty_level: Literal["beginner", "intermediate", "advanced"] | None = None
    average_duration_months: int | None = Field(default=None, ge=1, le=48)
    required_skills: list[str] | None = None
    recommended_tools: list[str] | None = None
    responsibilities: list[str] | None = None
    suggested_projects: list[str] | None = None
    recommended_certifications: list[str] | None = None
    market_demand: Literal["low", "medium", "high", "very_high"] | None = None
    salary_level: Literal["low", "medium", "high", "very_high"] | None = None
    tags: list[str] | None = None
    icon: str | None = None
    color: str | None = None
    is_active: bool | None = None


class AssessmentSubmit(BaseModel):
    answers: dict[str, Any] = {}
    preferred_area: str = Field(..., min_length=2, max_length=120)
    programming_level: Literal["beginner", "intermediate", "advanced"]
    favorite_subjects: list[str] = []
    current_skills: list[str] = []
    career_goal: str | None = Field(default=None, max_length=300)
    weekly_hours: int = Field(default=8, ge=1, le=80)
    learning_style: Literal["video", "reading", "project", "mixed"] = "mixed"
