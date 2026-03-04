# DevTrack — AI-Powered IT Project Management

A professional full-stack project management tool with AI-driven user story generation, Jira integration, GitHub code analysis, and real-time collaboration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS (dark theme), Zustand, TanStack Query, Recharts, Framer Motion |
| Backend | Node.js + Express 4, MongoDB Atlas (Mongoose), JWT Auth, Socket.io |
| AI Service | Python FastAPI, LangChain, OpenAI GPT-4o-mini, ChromaDB vector DB |
| DB | MongoDB Atlas |

---

## Project Structure

```
AI-POWERDDEVTRACK/
├── backend/          # Express.js REST API + Socket.io
├── frontend/         # React + Vite SPA
├── ai-service/       # Python FastAPI microservice
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (already configured)

### 1. Backend

```bash
cd backend
npm install          # already done
npm run dev          # starts on http://localhost:5000
```

### 2. AI Service (Optional — app works with mock fallback)

```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Add your OpenAI API key to ai-service/.env
# OPENAI_API_KEY=sk-...

# Start
python main.py       # starts on http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install          # already done
npm run dev          # starts on http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

| Variable | Value |
|----------|-------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `AI_SERVICE_URL` | `http://localhost:8000` |
| `PORT` | `5000` |

### `ai-service/.env`

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `MONGO_URI` | Same MongoDB Atlas connection string |
| `CHROMA_PERSIST_DIR` | `./chroma_store` |

---

## Features

### Authentication
- Register / Login with JWT
- Role-based access: Admin, Scrum Master, Developer

### Projects
- Create and manage projects with color themes
- Invite team members by email
- Project completion tracking

### AI Story Generation
1. Upload SRS document (PDF/DOCX/TXT) in the **Documents** tab
2. Go to **Stories** → click **AI Generate**
3. Enter a module name — AI generates Epics, User Stories and Tasks
4. Review, edit, and approve → stories are saved
5. Push to Jira with one click

### Sprints
- Create sprints (S1–S4 workflow)
- Activate / complete sprints
- Burndown chart visualization

### Integrations
- **Jira**: Connect with API token, push epics + stories, sync status
- **GitHub**: Connect repo, analyze commits against acceptance criteria, track code evidence

### Real-time
- Socket.io for live document ingestion status updates
- Project room-based events

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile/password |
| PUT | `/api/auth/integrations` | Save Jira/GitHub tokens |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/documents/project/:id` | List documents |
| POST | `/api/documents/upload/:id` | Upload document |
| POST | `/api/documents/:id/reingest` | Re-ingest document |
| GET | `/api/stories/project/:id` | List stories |
| POST | `/api/stories/generate/:id` | AI generate stories |
| POST | `/api/stories/save/:id` | Save generated stories |
| GET | `/api/sprints/project/:id` | List sprints |
| POST | `/api/sprints/project/:id` | Create sprint |
| GET | `/api/jira/test` | Test Jira connection |
| POST | `/api/jira/push/:id` | Push to Jira |
| POST | `/api/github/connect/:id` | Connect GitHub repo |
| POST | `/api/github/analyze/:id` | Analyze commits |

---

## Default Demo Account

Register a new account at `/register`. First registered user gets **Admin** role by default.

---

## Notes

- The AI service is optional — if unavailable, story generation returns realistic mock data automatically
- OpenAI API key is required only if you want real AI story generation
- All secrets should be rotated before production deployment
