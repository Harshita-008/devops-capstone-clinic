from datetime import datetime, time, timedelta

from app.clock import clinic_now


def slot(days: int = 1, hour: int = 10, minute: int = 0) -> str:
    """ISO time of an appointment slot `days` from today in clinic time."""
    day = clinic_now().date() + timedelta(days=days)
    return datetime.combine(day, time(hour, minute)).isoformat()
