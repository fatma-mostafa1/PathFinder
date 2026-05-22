from typing import Literal

from pydantic import BaseModel, HttpUrl


class UserCertificationUpdate(BaseModel):
    status: Literal["planned", "in_progress", "completed"] = "planned"
    certificate_url: HttpUrl | None = None
    notes: str | None = None
