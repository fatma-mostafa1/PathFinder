from datetime import datetime, timezone
from re import sub
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_insert_document(payload: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    return {**payload, "created_at": now, "updated_at": now}


def build_update_document(payload: dict[str, Any]) -> dict[str, Any]:
    clean_payload = {key: value for key, value in payload.items() if value is not None}
    clean_payload["updated_at"] = utc_now()
    return clean_payload


def clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return max(minimum, min(maximum, value))


def percentage(completed: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return round(clamp((completed / total) * 100), 2)


def slugify(value: str) -> str:
    slug = sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return sub(r"-+", "-", slug)


def normalize_text_list(values: list[str] | None) -> list[str]:
    return [item.strip() for item in values or [] if item and item.strip()]
