from typing import Annotated

from fastapi import APIRouter, Query, status

from ..db import DbSession
from ..schemas import PatientCreate, PatientOut, PatientUpdate
from ..services import patients as service

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=list[PatientOut])
def list_patients(db: DbSession, search: Annotated[str | None, Query(max_length=120)] = None):
    return service.list_patients(db, search)


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: int, db: DbSession):
    return service.get_patient(db, patient_id)


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: DbSession):
    return service.create_patient(db, payload)


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, payload: PatientUpdate, db: DbSession):
    return service.update_patient(db, patient_id, payload)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: DbSession):
    service.delete_patient(db, patient_id)
