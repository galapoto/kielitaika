#!/bin/bash
# PUHIS Backend Startup Script
# This script starts the backend server with the configured port

cd "$(dirname "$0")"

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Use PORT from .env or default to 5000
PORT=${PORT:-5000}
HOST=${HOST:-0.0.0.0}

echo "Starting PUHIS backend on http://${HOST}:${PORT}"
echo "API docs will be available at http://localhost:${PORT}/docs"
echo ""

uvicorn app.main:app --reload --host "$HOST" --port "$PORT"
