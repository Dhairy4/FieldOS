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

### Frontend Setup (Mobile)

```bash
cd frontend/mobile
npm install
npm run dev
```

### Frontend Setup (Dashboard)

```bash
cd frontend/dashboard
npm install
npm run dev
```

### Run with Docker

```bash
docker-compose up --build
```

## Environment Variables

See `backend/.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `GNANI_API_KEY` — Gnani AI API key
- `GNANI_PRISMA_ENDPOINT` — Prisma STT endpoint
- `GNANI_TIMBRE_ENDPOINT` — Timbre TTS endpoint
- `SECRET_KEY` — JWT secret key
- `LLM_API_KEY` — LLM provider API key (optional)

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