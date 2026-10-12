from pydantic import BaseModel


class DashboardStats(BaseModel):
    patients: int
    active_doctors: int
    appointments_today: int
    scheduled: int
    checked_in: int
    completed: int
    cancelled: int
