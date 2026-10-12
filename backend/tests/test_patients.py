NEW_PATIENT = {"full_name": "Arjun Kapoor", "phone": "9900112233", "gender": "MALE", "date_of_birth": "1990-06-15"}


def test_create_and_fetch_patient(client):
    created = client.post("/api/patients", json=NEW_PATIENT)

    assert created.status_code == 201
    patient_id = created.json()["id"]
    fetched = client.get(f"/api/patients/{patient_id}").json()
    assert fetched["full_name"] == "Arjun Kapoor"
    assert fetched["date_of_birth"] == "1990-06-15"


def test_create_patient_rejects_invalid_data(client):
    response = client.post("/api/patients", json={"full_name": "A", "phone": "12", "gender": "UNKNOWN"})

    assert response.status_code == 422
    invalid_fields = {error["loc"][-1] for error in response.json()["detail"]}
    assert invalid_fields == {"full_name", "phone", "gender"}


def test_search_matches_name_or_phone(client, patient):
    client.post("/api/patients", json=NEW_PATIENT)

    by_name = client.get("/api/patients", params={"search": "meera"}).json()
    by_phone = client.get("/api/patients", params={"search": "99001"}).json()

    assert [p["full_name"] for p in by_name] == ["Meera Nair"]
    assert [p["full_name"] for p in by_phone] == ["Arjun Kapoor"]


def test_update_patient_changes_only_sent_fields(client, patient):
    response = client.put(f"/api/patients/{patient.id}", json={"phone": "9000000001"})

    assert response.status_code == 200
    assert response.json()["phone"] == "9000000001"
    assert response.json()["full_name"] == "Meera Nair"


def test_delete_patient_without_history(client, patient):
    assert client.delete(f"/api/patients/{patient.id}").status_code == 204
    assert client.get(f"/api/patients/{patient.id}").status_code == 404


def test_patient_with_appointments_cannot_be_deleted(client, patient, book):
    book()

    response = client.delete(f"/api/patients/{patient.id}")

    assert response.status_code == 409


def test_unknown_patient_returns_404(client):
    response = client.get("/api/patients/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Patient not found"
