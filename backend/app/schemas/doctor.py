from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DoctorCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    specialization: str = Field(min_length=2, max_length=80)
    room: str = Field(default="", max_length=20)
    is_active: bool = True


class DoctorUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    specialization: str | None = Field(default=None, min_length=2, max_length=80)
    room: str | None = Field(default=None, max_length=20)
    is_active: bool | None = None


class DoctorOut(DoctorCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
