from prometheus_client import Counter

# Business metrics shown in Grafana next to the HTTP metrics from the instrumentator.
APPOINTMENTS_BOOKED = Counter(
    "clinic_appointments_booked_total",
    "Appointments booked through the API",
)
APPOINTMENT_STATUS_CHANGES = Counter(
    "clinic_appointment_status_changes_total",
    "Appointment status changes, labelled by the new status",
    ["status"],
)
