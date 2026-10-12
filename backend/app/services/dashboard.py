from datetime import datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..clock import clinic_now
from ..models import Appointment, Doctor, Patient
from ..schemas import DashboardStats


def get_stats(db: Session) -> DashboardStats:
    today_start = datetime.combine(clinic_now().date(), time.min)
    by_status = dict(db.execute(select(Appointment.status, func.count()).group_by(Appointment.status)).all())
    appointments_today = select(func.count()).where(
        Appointment.scheduled_at >= today_start,
        Appointment.scheduled_at < today_start + timedelta(days=1),
    )
    return DashboardStats(
        patients=db.scalar(select(func.count()).select_from(Patient)),
        active_doctors=db.scalar(select(func.count()).where(Doctor.is_active.is_(True))),
        appointments_today=db.scalar(appointments_today),
        scheduled=by_status.get("SCHEDULED", 0),
        checked_in=by_status.get("CHECKED_IN", 0),
        completed=by_status.get("COMPLETED", 0),
        cancelled=by_status.get("CANCELLED", 0),
    )
