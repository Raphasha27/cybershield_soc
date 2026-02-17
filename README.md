# CyberShield Modern (Demo Launch)

This project is currently configured as a **demo app** first.

Primary goal right now:
- ship a polished frontend experience on **Vercel** quickly,
- keep backend optional for local testing,
- avoid production-hardening scope until later.

## Current App Mode

- `frontend/`: React + Vite + Tailwind demo SOC dashboard (Vercel-ready)
- `backend/`: FastAPI prototype API (optional for local development)
- If backend is not reachable, frontend automatically switches to **demo data mode**.

## Quick Start (Frontend Demo)

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

## Vercel Deployment (Frontend Only)

Deploy `frontend/` as the project root in Vercel.

Recommended env vars for demo deployment:
- `VITE_API_BASE_URL` (optional)
- `VITE_WS_URL` (optional)

If these are not set or the backend is down, demo data is displayed.

## Optional Local Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

## Notes

- This is intentionally **not** a production deployment profile.
- Production concerns (hard security, scaling, observability, infra) are deferred to a later phase.
