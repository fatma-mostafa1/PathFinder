from re import fullmatch

from fastapi import HTTPException, status


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_percentage(value: float) -> float:
    if value < 0 or value > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Percentage must be between 0 and 100",
        )
    return value


def validate_slug(slug: str) -> str:
    if not fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Slug must contain lowercase letters, numbers, and hyphens only",
        )
    return slug
