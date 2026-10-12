from typing import get_args

from prometheus_client import Counter

from .schemas import AppointmentStatus

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

# Create every labelled series at 0 on startup. Otherwise a series first appears already at 1,
# and Prometheus increase() and rate() miss that first change.
for status in get_args(AppointmentStatus):
    APPOINTMENT_STATUS_CHANGES.labels(status=status)
