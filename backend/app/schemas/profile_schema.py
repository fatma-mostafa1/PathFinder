from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class ProfileUpsert(BaseModel):
    university: str | None = Field(default=None, max_length=160)
    college: str | None = Field(default=None, max_length=160)
    academic_year: str | None = Field(default=None, max_length=80)
    major: str | None = Field(default=None, max_length=120)
    gpa: float | None = Field(default=None, ge=0, le=4)
    country: str | None = Field(default=None, max_length=120)
    city: str | None = Field(default=None, max_length=120)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None
    preferred_language: str | None = Field(default="en", max_length=8)
    weekly_available_hours: int | None = Field(default=8, ge=1, le=80)
    preferred_learning_style: Literal["video", "reading", "project", "mixed"] | None = "mixed"
    career_goal: str | None = Field(default=None, max_length=300)
