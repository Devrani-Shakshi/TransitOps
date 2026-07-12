#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# If arguments are passed, execute them directly (e.g., celery worker)
if [ $# -gt 0 ]; then
    echo "Starting custom command: $@"
    exec "$@"
fi

echo "Running migrations..."
alembic upgrade head || echo "Migration command failed or already applied"

echo "Seeding database..."
python seed.py || echo "Seeding failed or database already seeded"

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
