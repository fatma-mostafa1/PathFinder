from typing import Literal

from pydantic import BaseModel


class InterviewProgressUpdate(BaseModel):
    status: Literal["not_started", "practiced", "mastered"] = "practiced"
    user_answer: str | None = None
    notes: str | None = None
