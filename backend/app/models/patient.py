from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..clock import utc_now
from ..db import Base

if TYPE_CHECKING:
    from .appointment import Appointment


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(120))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(10), default="OTHER")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    appointments: Mapped[list[Appointment]] = relationship(back_populates="patient")
