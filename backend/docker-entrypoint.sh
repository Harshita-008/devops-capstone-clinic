#!/bin/sh
set -e

# Compose runs migrations on startup. Kubernetes sets RUN_MIGRATIONS=false and runs them once
# in a separate Job, so several replicas never migrate the same database at the same time.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    alembic upgrade head
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"
