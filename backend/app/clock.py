from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from .config import settings


def utc_now() -> datetime:
    return datetime.now(UTC)


def clinic_now() -> datetime:
    """Current wall-clock time at the clinic, without tzinfo, to compare with scheduled_at."""
    return datetime.now(ZoneInfo(settings.clinic_timezone)).replace(tzinfo=None)


def to_clinic_time(value: datetime) -> datetime:
    """Accept naive local times from the UI or aware times from API clients; store clinic local time."""
    if value.tzinfo is None:
        return value
    return value.astimezone(ZoneInfo(settings.clinic_timezone)).replace(tzinfo=None)
