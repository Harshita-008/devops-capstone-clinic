from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session


def test_health_reports_up(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_ready_checks_database(client):
    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "READY", "database": "UP"}


def test_ready_returns_503_when_database_is_down(client, monkeypatch):
    def broken_execute(*args, **kwargs):
        raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    monkeypatch.setattr(Session, "execute", broken_execute)

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json() == {"status": "NOT_READY", "database": "DOWN"}


def test_root_describes_service(client):
    body = client.get("/").json()

    assert body["service"] == "ClinicFlow API"
    assert body["docs"] == "/docs"


def test_metrics_exposes_http_and_clinic_metrics(client, book):
    book()

    metrics = client.get("/metrics").text

    assert "http_requests_total" in metrics
    assert "clinic_appointments_booked_total" in metrics


def test_status_change_series_exist_before_any_change(client):
    metrics = client.get("/metrics").text

    for status in ("SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"):
        assert f'clinic_appointment_status_changes_total{{status="{status}"}}' in metrics
