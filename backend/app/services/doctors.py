from sqlalchemy import select
from sqlalchemy.orm import Session

from ..errors import ConflictError
from ..models import Doctor
from ..schemas import DoctorCreate, DoctorUpdate
from .common import apply_changes, count_appointments, get_or_404, save


def list_doctors(db: Session, active_only: bool = False) -> list[Doctor]:
    query = select(Doctor).order_by(Doctor.full_name)
    if active_only:
        query = query.where(Doctor.is_active.is_(True))
    return list(db.scalars(query))


def get_doctor(db: Session, doctor_id: int) -> Doctor:
    return get_or_404(db, Doctor, doctor_id)


def create_doctor(db: Session, payload: DoctorCreate) -> Doctor:
    return save(db, Doctor(**payload.model_dump()))


def update_doctor(db: Session, doctor_id: int, payload: DoctorUpdate) -> Doctor:
    doctor = get_doctor(db, doctor_id)
    return apply_changes(db, doctor, payload.model_dump(exclude_unset=True))


def delete_doctor(db: Session, doctor_id: int) -> None:
    doctor = get_doctor(db, doctor_id)
    if count_appointments(db, doctor_id=doctor_id):
        raise ConflictError("Doctor has appointments and cannot be deleted. Set is_active to false instead.")
    db.delete(doctor)
    db.commit()
