from tests.helpers import slot


def test_book_appointment_returns_patient_and_doctor_names(book):
    response = book(at=slot(hour=11))

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "SCHEDULED"
    assert body["patient_name"] == "Meera Nair"
    assert body["doctor_name"] == "Dr. Asha Iyer"


def test_timezone_aware_time_is_stored_as_clinic_time(book):
    # 04:30 UTC is 10:00 in the clinic timezone (Asia/Kolkata, UTC+05:30).
    utc_time = slot(hour=4, minute=30) + "+00:00"

    response = book(at=utc_time)

    assert response.status_code == 201
    assert response.json()["scheduled_at"] == slot(hour=10)


def test_cannot_book_in_the_past(book):
    response = book(at=slot(days=-1))

    assert response.status_code == 400
    assert response.json()["detail"] == "Appointment time must be in the future"


def test_doctor_cannot_be_double_booked_within_a_slot(book):
    book(at=slot(hour=10, minute=0))

    clash = book(at=slot(hour=10, minute=15))
    next_slot = book(at=slot(hour=10, minute=30))

    assert clash.status_code == 409
    assert next_slot.status_code == 201


def test_different_doctors_can_share_a_time(book, other_doctor):
    assert book(at=slot()).status_code == 201
    assert book(at=slot(), doctor_id=other_doctor.id).status_code == 201


def test_cancelling_frees_the_slot(client, book):
    first = book().json()
    client.put(f"/api/appointments/{first['id']}", json={"status": "CANCELLED"})

    assert book().status_code == 201


def test_inactive_doctor_cannot_be_booked(client, book, doctor):
    client.put(f"/api/doctors/{doctor.id}", json={"is_active": False})

    response = book()

    assert response.status_code == 400
    assert response.json()["detail"] == "Doctor is not accepting appointments"


def test_booking_for_unknown_patient_returns_404(client, doctor):
    response = client.post(
        "/api/appointments",
        json={"patient_id": 999, "doctor_id": doctor.id, "scheduled_at": slot(), "reason": "Fever"},
    )

    assert response.status_code == 404


def test_status_flow_and_closed_appointment_is_locked(client, book):
    appointment_id = book().json()["id"]
    url = f"/api/appointments/{appointment_id}"

    assert client.put(url, json={"status": "CHECKED_IN"}).json()["status"] == "CHECKED_IN"
    assert client.put(url, json={"status": "COMPLETED", "notes": "Rest for 3 days"}).status_code == 200

    reschedule = client.put(url, json={"scheduled_at": slot(days=2)})
    add_notes = client.put(url, json={"notes": "Follow up next week"})

    assert reschedule.status_code == 400
    assert add_notes.status_code == 200


def test_reschedule_into_a_taken_slot_is_rejected(client, book):
    book(at=slot(hour=9))
    second = book(at=slot(hour=12)).json()

    response = client.put(f"/api/appointments/{second['id']}", json={"scheduled_at": slot(hour=9, minute=10)})

    assert response.status_code == 409


def test_filter_by_status_and_date(client, book):
    tomorrow = book(at=slot(days=1)).json()
    day_after = book(at=slot(days=2)).json()
    client.put(f"/api/appointments/{tomorrow['id']}", json={"status": "CHECKED_IN"})

    checked_in = client.get("/api/appointments", params={"status": "CHECKED_IN"}).json()
    on_day_after = client.get("/api/appointments", params={"on_date": slot(days=2)[:10]}).json()

    assert [a["id"] for a in checked_in] == [tomorrow["id"]]
    assert [a["id"] for a in on_day_after] == [day_after["id"]]


def test_filter_by_doctor_and_patient(client, book, patient, other_doctor):
    with_default_doctor = book(at=slot(hour=9)).json()
    book(at=slot(hour=9), doctor_id=other_doctor.id)

    by_doctor = client.get("/api/appointments", params={"doctor_id": with_default_doctor["doctor_id"]}).json()
    by_patient = client.get("/api/appointments", params={"patient_id": patient.id}).json()

    assert [a["id"] for a in by_doctor] == [with_default_doctor["id"]]
    assert len(by_patient) == 2


def test_delete_appointment(client, book):
    appointment_id = book().json()["id"]

    assert client.delete(f"/api/appointments/{appointment_id}").status_code == 204
    assert client.get(f"/api/appointments/{appointment_id}").status_code == 404
