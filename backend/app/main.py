import logging

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from .config import settings
from .errors import register_error_handlers
from .routers import appointments, dashboard, doctors, patients, system

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Clinic appointment management API: patients, doctors and appointments.",
)

register_error_handlers(app)

for module in (system, patients, doctors, appointments, dashboard):
    app.include_router(module.router)

# Request count, latency and in-progress metrics for Prometheus. Probe endpoints are left out as noise.
Instrumentator(excluded_handlers=["/metrics", "/health", "/ready"]).instrument(app).expose(
    app, endpoint="/metrics", include_in_schema=False
)
