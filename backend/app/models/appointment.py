from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..clock import utc_now
from ..db import Base
from .doctor import Doctor
from .patient import Patient


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False, index=True)
    # Clinic local time, stored without a timezone so SQLite and PostgreSQL behave the same.
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    reason: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="SCHEDULED", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped[Patient] = relationship(back_populates="appointments")
    doctor: Mapped[Doctor] = relationship(back_populates="appointments")

    @property
    def patient_name(self) -> str:
        return self.patient.full_name

    @property
    def doctor_name(self) -> str:
        return self.doctor.full_name
