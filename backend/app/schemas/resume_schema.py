from typing import Any

from pydantic import BaseModel, EmailStr, Field, HttpUrl


class ResumeUpsert(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    linkedin: HttpUrl | None = None
    github: HttpUrl | None = None
    portfolio: HttpUrl | None = None
    summary: str | None = Field(default=None, max_length=1200)
    education: list[dict[str, Any]] = []
    skills: list[str] = []
    projects: list[dict[str, Any]] = []
    certifications: list[dict[str, Any]] = []
    experience: list[dict[str, Any]] = []
    languages: list[str] = []
