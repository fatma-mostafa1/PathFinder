from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None


class UserPublic(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: Literal["student", "admin"]
    is_active: bool
    is_verified: bool
    created_at: str
    updated_at: str
    last_login: str | None = None


class UserSettingsUpdate(BaseModel):
    dark_mode: bool | None = None
    notifications_enabled: bool | None = None
    email_notifications: bool | None = None
    language: str | None = Field(default=None, min_length=2, max_length=8)
    privacy_level: Literal["private", "public", "connections"] | None = None


class GenericUserPayload(BaseModel):
    data: dict[str, Any]
