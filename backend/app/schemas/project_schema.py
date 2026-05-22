from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class UserProjectCreate(BaseModel):
    project_id: str
    status: Literal["not_started", "in_progress", "completed"] = "not_started"
    github_link: HttpUrl | None = None
    live_demo_link: HttpUrl | None = None
    notes: str | None = None
    progress_percentage: float = Field(default=0, ge=0, le=100)


class UserProjectUpdate(BaseModel):
    status: Literal["not_started", "in_progress", "completed"] | None = None
    github_link: HttpUrl | None = None
    live_demo_link: HttpUrl | None = None
    notes: str | None = None
    progress_percentage: float | None = Field(default=None, ge=0, le=100)
