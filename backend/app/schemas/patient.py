from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Gender = Literal["MALE", "FEMALE", "OTHER"]


class PatientCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=20)
    email: str | None = Field(default=None, max_length=120)
    date_of_birth: date | None = None
    gender: Gender = "OTHER"


class PatientUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, min_length=7, max_length=20)
    email: str | None = Field(default=None, max_length=120)
    date_of_birth: date | None = None
    gender: Gender | None = None


class PatientOut(PatientCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
