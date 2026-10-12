import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from ..config import settings
from ..db import DbSession

logger = logging.getLogger(__name__)
router = APIRouter(tags=["system"])


@router.get("/")
def root():
    return {"service": settings.app_name, "version": settings.app_version, "docs": "/docs"}


@router.get("/health")
def health():
    """Liveness: the process is up and answering. Does not touch the database."""
    return {"status": "UP"}


@router.get("/ready")
def ready(db: DbSession):
    """Readiness: the API can reach the database, so it can serve real traffic."""
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.exception("Readiness check failed: database unreachable")
        return JSONResponse(status_code=503, content={"status": "NOT_READY", "database": "DOWN"})
    return {"status": "READY", "database": "UP"}
