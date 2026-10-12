from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..errors import ConflictError
from ..models import Patient
from ..schemas import PatientCreate, PatientUpdate
from .common import apply_changes, count_appointments, get_or_404, save


def list_patients(db: Session, search: str | None = None) -> list[Patient]:
    query = select(Patient).order_by(Patient.full_name)
    if search:
        query = query.where(or_(func.lower(Patient.full_name).contains(search.lower()), Patient.phone.contains(search)))
    return list(db.scalars(query))


def get_patient(db: Session, patient_id: int) -> Patient:
    return get_or_404(db, Patient, patient_id)


def create_patient(db: Session, payload: PatientCreate) -> Patient:
    return save(db, Patient(**payload.model_dump()))


def update_patient(db: Session, patient_id: int, payload: PatientUpdate) -> Patient:
    patient = get_patient(db, patient_id)
    return apply_changes(db, patient, payload.model_dump(exclude_unset=True))


def delete_patient(db: Session, patient_id: int) -> None:
    patient = get_patient(db, patient_id)
    # Appointment history is a medical record, so it is never removed along with the patient.
    if count_appointments(db, patient_id=patient_id):
        raise ConflictError("Patient has appointments and cannot be deleted")
    db.delete(patient)
    db.commit()
