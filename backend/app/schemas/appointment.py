from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

AppointmentStatus = Literal["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"]


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    scheduled_at: datetime
    reason: str = Field(min_length=2, max_length=200)
    notes: str = ""


class AppointmentUpdate(BaseModel):
    doctor_id: int | None = None
    scheduled_at: datetime | None = None
    reason: str | None = Field(default=None, min_length=2, max_length=200)
    status: AppointmentStatus | None = None
    notes: str | None = None


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    scheduled_at: datetime
    reason: str
    status: AppointmentStatus
    notes: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
