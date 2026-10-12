from tests.helpers import slot


def test_stats_count_patients_doctors_and_statuses(client, book, other_doctor):
    first = book(at=slot(hour=9)).json()
    book(at=slot(hour=11))
    client.put(f"/api/appointments/{first['id']}", json={"status": "CANCELLED"})
    client.put(f"/api/doctors/{other_doctor.id}", json={"is_active": False})

    stats = client.get("/api/dashboard/stats").json()

    assert stats["patients"] == 1
    assert stats["active_doctors"] == 1
    assert stats["scheduled"] == 1
    assert stats["cancelled"] == 1
    assert stats["completed"] == 0


def test_stats_on_empty_clinic(client):
    stats = client.get("/api/dashboard/stats").json()

    assert stats == {
        "patients": 0,
        "active_doctors": 0,
        "appointments_today": 0,
        "scheduled": 0,
        "checked_in": 0,
        "completed": 0,
        "cancelled": 0,
    }
