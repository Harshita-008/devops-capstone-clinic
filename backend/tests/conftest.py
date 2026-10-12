from collections.abc import Callable, Iterator

import pytest
from fastapi.testclient import TestClient
from httpx2 import Response
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models import Doctor, Patient
from tests.helpers import slot

# In-memory SQLite shared through one connection; the real PostgreSQL database is never used by tests.
engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False)


@pytest.fixture
def db() -> Iterator[Session]:
    Base.metadata.create_all(engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def add[ModelT](db: Session, obj: ModelT) -> ModelT:
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def doctor(db: Session) -> Doctor:
    return add(db, Doctor(full_name="Dr. Asha Iyer", specialization="General Medicine", room="101"))


@pytest.fixture
def other_doctor(db: Session) -> Doctor:
    return add(db, Doctor(full_name="Dr. Rohan Das", specialization="Dermatology", room="207"))


@pytest.fixture
def patient(db: Session) -> Patient:
    return add(db, Patient(full_name="Meera Nair", phone="9812345670", gender="FEMALE"))


@pytest.fixture
def book(client: TestClient, patient: Patient, doctor: Doctor) -> Callable[..., Response]:
    """Books an appointment for the default patient and doctor unless others are passed."""

    def _book(at: str | None = None, doctor_id: int | None = None, reason: str = "General check-up") -> Response:
        return client.post(
            "/api/appointments",
            json={
                "patient_id": patient.id,
                "doctor_id": doctor_id or doctor.id,
                "scheduled_at": at or slot(),
                "reason": reason,
            },
        )

    return _book
