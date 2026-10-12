#!/bin/sh
set -e

# Compose migrates on startup. Kubernetes runs migrations in an init container instead and
# sets RUN_MIGRATIONS=false here, so the API container only serves traffic.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    alembic upgrade head
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"
