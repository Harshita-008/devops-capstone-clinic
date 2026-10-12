from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from .config import settings


def utc_now() -> datetime:
    return datetime.now(UTC)


def clinic_now() -> datetime:
    """Current wall-clock time at the clinic, without tzinfo, to compare with scheduled_at."""
    return datetime.now(ZoneInfo(settings.clinic_timezone)).replace(tzinfo=None)


def to_clinic_time(value: datetime) -> datetime:
    """Convert a time from the API to clinic local time without tzinfo."""
    if value.tzinfo is None:
        return value
    return value.astimezone(ZoneInfo(settings.clinic_timezone)).replace(tzinfo=None)
