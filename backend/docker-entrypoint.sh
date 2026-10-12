#!/bin/sh
set -e

# Kubernetes sets RUN_MIGRATIONS=false because an init container runs the migrations there.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    alembic upgrade head
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"
