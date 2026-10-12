from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from ..db import DbSession
from ..schemas import AppointmentCreate, AppointmentOut, AppointmentStatus, AppointmentUpdate
from ..services import appointments as service

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    db: DbSession,
    status_filter: Annotated[AppointmentStatus | None, Query(alias="status")] = None,
    doctor_id: int | None = None,
    patient_id: int | None = None,
    on_date: date | None = None,
):
    return service.list_appointments(db, status_filter, doctor_id, patient_id, on_date)


@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(appointment_id: int, db: DbSession):
    return service.get_appointment(db, appointment_id)


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(payload: AppointmentCreate, db: DbSession):
    return service.create_appointment(db, payload)


@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(appointment_id: int, payload: AppointmentUpdate, db: DbSession):
    return service.update_appointment(db, appointment_id, payload)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: DbSession):
    service.delete_appointment(db, appointment_id)
