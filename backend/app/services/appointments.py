from datetime import date, datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..clock import clinic_now, to_clinic_time
from ..config import settings
from ..errors import BusinessRuleError, ConflictError
from ..metrics import APPOINTMENT_STATUS_CHANGES, APPOINTMENTS_BOOKED
from ..models import Appointment, Doctor, Patient
from ..schemas import AppointmentCreate, AppointmentUpdate
from .common import apply_changes, get_or_404, save

CLOSED_STATUSES = {"COMPLETED", "CANCELLED"}
WITH_NAMES = [joinedload(Appointment.patient), joinedload(Appointment.doctor)]


def list_appointments(
    db: Session,
    status: str | None = None,
    doctor_id: int | None = None,
    patient_id: int | None = None,
    on_date: date | None = None,
) -> list[Appointment]:
    query = select(Appointment).options(*WITH_NAMES).order_by(Appointment.scheduled_at)
    if status:
        query = query.where(Appointment.status == status)
    if doctor_id:
        query = query.where(Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.where(Appointment.patient_id == patient_id)
    if on_date:
        day_start = datetime.combine(on_date, time.min)
        day_end = day_start + timedelta(days=1)
        query = query.where(Appointment.scheduled_at >= day_start, Appointment.scheduled_at < day_end)
    return list(db.scalars(query))


def get_appointment(db: Session, appointment_id: int) -> Appointment:
    return get_or_404(db, Appointment, appointment_id, options=WITH_NAMES)


def create_appointment(db: Session, payload: AppointmentCreate) -> Appointment:
    get_or_404(db, Patient, payload.patient_id)
    scheduled_at = to_clinic_time(payload.scheduled_at)
    _check_doctor_bookable(db, payload.doctor_id)
    _check_in_future(scheduled_at)
    _check_slot_free(db, payload.doctor_id, scheduled_at)

    appointment = save(db, Appointment(**payload.model_dump(exclude={"scheduled_at"}), scheduled_at=scheduled_at))
    APPOINTMENTS_BOOKED.inc()
    return appointment


def update_appointment(db: Session, appointment_id: int, payload: AppointmentUpdate) -> Appointment:
    appointment = get_appointment(db, appointment_id)
    changes = payload.model_dump(exclude_unset=True)

    if appointment.status in CLOSED_STATUSES and changes.keys() - {"notes"}:
        raise BusinessRuleError(f"A {appointment.status.lower()} appointment can only have its notes edited")

    if "scheduled_at" in changes:
        changes["scheduled_at"] = to_clinic_time(changes["scheduled_at"])
        _check_in_future(changes["scheduled_at"])
    if "doctor_id" in changes:
        _check_doctor_bookable(db, changes["doctor_id"])
    if changes.keys() & {"scheduled_at", "doctor_id"}:
        _check_slot_free(
            db,
            changes.get("doctor_id", appointment.doctor_id),
            changes.get("scheduled_at", appointment.scheduled_at),
            ignore_id=appointment.id,
        )

    old_status = appointment.status
    appointment = apply_changes(db, appointment, changes)
    if appointment.status != old_status:
        APPOINTMENT_STATUS_CHANGES.labels(status=appointment.status).inc()
    return appointment


def delete_appointment(db: Session, appointment_id: int) -> None:
    db.delete(get_appointment(db, appointment_id))
    db.commit()


def _check_doctor_bookable(db: Session, doctor_id: int) -> None:
    if not get_or_404(db, Doctor, doctor_id).is_active:
        raise BusinessRuleError("Doctor is not accepting appointments")


def _check_in_future(scheduled_at: datetime) -> None:
    if scheduled_at <= clinic_now():
        raise BusinessRuleError("Appointment time must be in the future")


def _check_slot_free(db: Session, doctor_id: int, scheduled_at: datetime, ignore_id: int | None = None) -> None:
    """A doctor cannot have two open appointments starting within one slot of each other."""
    slot = timedelta(minutes=settings.slot_minutes)
    query = select(Appointment.id).where(
        Appointment.doctor_id == doctor_id,
        Appointment.status.not_in(CLOSED_STATUSES),
        Appointment.scheduled_at > scheduled_at - slot,
        Appointment.scheduled_at < scheduled_at + slot,
    )
    if ignore_id is not None:
        query = query.where(Appointment.id != ignore_id)
    if db.scalar(query.limit(1)) is not None:
        raise ConflictError("Doctor already has an appointment in this time slot")
