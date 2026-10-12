from fastapi import APIRouter

from ..db import DbSession
from ..schemas import DashboardStats
from ..services import dashboard as service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: DbSession):
    return service.get_stats(db)
