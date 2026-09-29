#!/bin/bash

cleanup() {
  echo ""
  echo "Stopping development services..."

  kill "$REACT_PID" 2>/dev/null || true
  kill "$FASTAPI_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Starting FastAPI..."
python -m uvicorn services.intake_service.app.main:app \
  --reload \
  --port 8000 &

FASTAPI_PID=$!

echo "Starting React..."
npm start &

REACT_PID=$!

wait