# FieldOS — AI Co-Worker for Field Operations

Voice-first, multilingual field operations platform built for the Gnani AI Internship Challenge. FieldOS enables field technicians to report issues, inspections, and completed tasks using natural voice in Gujarati, Hindi, English, and Hinglish — converting speech into structured work orders and operational actions.

## Project Structure

```
FieldOS/
├── backend/                 # FastAPI + Python backend
│   ├── app/
│   │   ├── main.py          # FastAPI entrypoint
│   │   ├── api/v1/endpoints/# REST API route handlers
│   │   ├── services/        # Business logic (voice, intelligence, workflow)
│   │   ├── models/          # DB models + Pydantic schemas
│   │   ├── core/            # Config & security
│   │   └── db/              # Database session management
│   ├── alembic/             # DB migrations
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── mobile/              # Next.js technician mobile interface
│   └── dashboard/           # Next.js supervisor command center
├── ai-engine/               # Optional standalone LLM/rule service
├── tests/
│   ├── backend/
│   └── frontend/
├── docs/
│   └── "Proposed Solution .md"
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + Tailwind CSS |
| Backend | Python + FastAPI |
| Speech-to-Text | Gnani Prisma |
| Text-to-Speech | Gnani Timbre |
| Reasoning | LLM / Evon |
| Validation | Pydantic |
| Database | PostgreSQL |
| Deployment | Vercel + Python hosting |

## Core Modules

1. **Voice Intelligence** — Multilingual STT/TTS, voice-based reporting, spoken confirmations
2. **Operational Intelligence** — Structured extraction, clarification, report validation
3. **Action & Workflow Management** — Work-order creation, task assignment, escalation
4. **Supervisor Command Center** — Reports, technician activity, analytics, resolution tracking

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Gnani AI API credentials (Prisma STT + Timbre TTS)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Gnani API keys and DB credentials
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Demo Accounts

The backend comes with pre-seeded demo accounts for the internship challenge
(use `demo1234` as the password for all):

| Email | Role | Language |
|-------|------|----------|
| `tech.demo@fieldos.ai` | Technician | Hinglish |
| `supervisor.demo@fieldos.ai` | Supervisor | English |

Log in via either frontend app at `/login` with any of the above credentials.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

This starts both apps at once:

- Dashboard (supervisors): http://localhost:3002
- Mobile (technicians): http://localhost:3001

To run just one: `npm run dev:dashboard` or `npm run dev:mobile`.

### Run with Docker

```bash
docker-compose up --build
```

## Environment Variables

See `backend/.env.example` for the full list:
- `DATABASE_URL` — PostgreSQL connection string
- `GNANI_API_KEY` — Gnani AI API key
- `GNANI_BASE_URL` — Gnani API base URL
- `SECRET_KEY` — JWT signing secret (required to be ≥32 chars in production)
- `CORS_ORIGINS` — comma-separated allowed browser origins (never `*` in production)
- `ALLOW_SQLITE_FALLBACK` — dev-only SQLite fallback (forced off in production)
- `SEED_DEMO_DATA` — seed demo users/data (never runs in production)
- `MAX_AUDIO_BYTES` / `VOICE_RATE_LIMIT_PER_MINUTE` — voice upload/rate guardrails
- `APP_ENV` — `development` or `production`

### Production Checklist

1. Set `APP_ENV=production`.
2. Generate a unique secret: `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
3. Set `CORS_ORIGINS` to your real frontend origins (no wildcard).
4. Keep `ALLOW_SQLITE_FALLBACK=false` and `SEED_DEMO_DATA=false`.
5. Run `alembic upgrade head` before starting the API (the Docker image does this automatically).
6. Use managed PostgreSQL with backups; the API refuses to start if it is unreachable in production.

Passwords are stored as bcrypt hashes in the `users` table. The demo accounts are
seeded only when `SEED_DEMO_DATA=true` in a non-production environment.

## MVP Flow (Challenge Scope)

1. Technician opens FieldOS mobile app
2. Reports a machine issue in Gujarati/Hinglish via voice
3. Gnani Prisma transcribes the audio
4. AI extracts equipment and issue information
5. FieldOS asks follow-up questions for missing details
6. Timbre reads back the report for confirmation
7. A maintenance work order is created
8. Supervisor receives it on the dashboard and assigns a technician

## Team Responsibilities

| Responsibility | You | Your friend |
|----------------|-----|-------------|
| Frontend | Mobile interface | Supervisor dashboard |
| Backend | FastAPI & API integration | Database & workflow APIs |
| AI | Gnani speech integration | Information extraction & validation |
| Testing | End-to-end integration | Language & noise testing |
| Deployment | Backend deployment | Frontend deployment |

## License

MIT