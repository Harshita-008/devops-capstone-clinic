def test_create_doctor(client):
    response = client.post("/api/doctors", json={"full_name": "Dr. Neha Gupta", "specialization": "ENT", "room": "112"})

    assert response.status_code == 201
    assert response.json()["is_active"] is True


def test_active_only_filter_hides_inactive_doctors(client, doctor, other_doctor):
    client.put(f"/api/doctors/{other_doctor.id}", json={"is_active": False})

    all_doctors = client.get("/api/doctors").json()
    active = client.get("/api/doctors", params={"active_only": True}).json()

    assert len(all_doctors) == 2
    assert [d["full_name"] for d in active] == ["Dr. Asha Iyer"]


def test_doctor_with_appointments_cannot_be_deleted(client, doctor, book):
    book()

    response = client.delete(f"/api/doctors/{doctor.id}")

    assert response.status_code == 409
    assert "is_active" in response.json()["detail"]


def test_delete_doctor_without_history(client, other_doctor):
    assert client.delete(f"/api/doctors/{other_doctor.id}").status_code == 204
    assert client.get(f"/api/doctors/{other_doctor.id}").status_code == 404
