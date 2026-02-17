# CyberShield Modern (Enterprise Migration)

This repository now contains a full-stack **React + FastAPI + PostgreSQL** SOC platform with Docker orchestration.

## Architecture

- `frontend/`: React + Vite + Tailwind SOC dashboard.
- `backend/`: FastAPI API, AI threat scoring hook, WebSocket log stream.
- `docker-compose.yml`: launches frontend, backend, and PostgreSQL.
- Legacy Angular files are still present at repository root for reference while migration completes.

## Features Included

- Incident API (`GET/POST /api/v1/incidents`)
- AI-assisted severity scoring (`POST /api/v1/incidents/score`)
- Live WebSocket security feed (`ws://localhost:8000/api/v1/logs/stream`)
- React SOC dashboard with KPI cards, trend chart, and live log panel
- Dockerized local development stack

## Quick Start

### 1) Run with Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

### 2) Run services manually

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend supports:

- `DATABASE_URL` (default points to Docker postgres service)
- `OPENAI_API_KEY` (optional; if missing, heuristic fallback scoring is used)
- `JWT_SECRET_KEY`
- `CORS_ORIGINS` (comma-separated list, or `*`)

## Deployment Guide

### Frontend

- Deploy `frontend/` to Vercel or Netlify.
- Set `VITE_API_BASE_URL` and `VITE_WS_URL` to your backend URL.

### Backend

- Deploy `backend/` to Render, Railway, or ECS.
- Use managed PostgreSQL and set `DATABASE_URL`.
- Production command:

```bash
gunicorn -k uvicorn.workers.UvicornWorker app.main:app
```

## Next Enterprise Enhancements

- JWT login + RBAC routes
- Persistent audit log table + retention policies
- Alert deduplication and SLA timers
- SIEM connectors (Splunk, Sentinel, Elastic)


## Quality Gates

- GitHub Actions workflow (`.github/workflows/ci.yml`) compiles backend modules on every push/PR.
- AI scoring automatically falls back to deterministic heuristics when the OpenAI API is unavailable.
- Frontend dashboard includes API error reporting and WebSocket auto-reconnect behavior for unstable links.
