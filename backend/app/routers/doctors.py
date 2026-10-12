from fastapi import APIRouter, status

from ..db import DbSession
from ..schemas import DoctorCreate, DoctorOut, DoctorUpdate
from ..services import doctors as service

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


@router.get("", response_model=list[DoctorOut])
def list_doctors(db: DbSession, active_only: bool = False):
    return service.list_doctors(db, active_only)


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(doctor_id: int, db: DbSession):
    return service.get_doctor(db, doctor_id)


@router.post("", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def create_doctor(payload: DoctorCreate, db: DbSession):
    return service.create_doctor(db, payload)


@router.put("/{doctor_id}", response_model=DoctorOut)
def update_doctor(doctor_id: int, payload: DoctorUpdate, db: DbSession):
    return service.update_doctor(db, doctor_id, payload)


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(doctor_id: int, db: DbSession):
    service.delete_doctor(db, doctor_id)
