# StageMind — CLAUDE.md

> **AI Builder Brief:** StageMind is a hackathon project. Read `PRODUCT_SPEC.md` for all data models, MVP scope, and feature specs before writing any code. This file only covers rules that are NOT derivable from the spec.

---

## Project Overview

An AI-driven interactive narrative engine: users upload a story → AI generates an explorable branching world with characters, scenes, and choices.

**Hackathon mode:** ship fast, commit often, demo wins over polish.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | Next.js 15 + TypeScript + Tailwind + shadcn/ui | App Router |
| Branch viz | React Flow | For WorldMap / BranchNode rendering |
| State | Zustand | Client-side only, no Redux |
| Backend | FastAPI (Python 3.12) | Handles ADK agent calls |
| AI Orchestration | Google ADK (`google-adk`) | Multi-agent pipeline |
| LLM | Gemini 2.5 Flash | Default; use Pro only for complex parsing |
| Real-time dialogue | Gemini Live API via ADK bidi-streaming | Character role-play |
| Database | Firestore | StoryPack + session persistence |
| Semantic search | Vertex AI Embeddings + in-memory | Character/scene retrieval |
| Frontend deploy | Vercel | |
| Backend deploy | Google Cloud Run | |

---

## Directory Structure

```
stage-mind/
├── frontend/                 # Next.js 15 app
│   ├── app/                  # App Router pages
│   │   ├── upload/           # Story upload page
│   │   ├── world/[id]/       # World overview + map
│   │   ├── scene/[id]/       # Scene experience
│   │   └── editor/[id]/      # Co-creation editor
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (auto-generated, don't edit)
│   │   ├── world/            # WorldMap, BranchTree, CharacterCard
│   │   └── scene/            # DialogueBox, ActionPanel, ChoiceButtons
│   └── lib/
│       ├── store/            # Zustand stores
│       ├── api/              # Frontend API client (calls /api/v1/*)
│       └── types/            # TypeScript types (mirror PRODUCT_SPEC.md data models)
│
├── backend/
│   ├── agents/               # ADK Agent definitions
│   │   ├── director_agent.py       # Root coordinator
│   │   ├── story_parser_agent.py   # Text → Characters/Scenes/Branches
│   │   ├── world_generator_agent.py # Scenes → WorldMap JSON
│   │   └── character_agent.py      # Live API role-play agent
│   ├── api/
│   │   └── v1/               # FastAPI routers (upload, world, scene, editor)
│   ├── services/
│   │   ├── firestore.py      # DB read/write helpers
│   │   └── embeddings.py     # Vertex AI embedding + in-memory search
│   └── main.py               # FastAPI app entrypoint
│
├── CLAUDE.md                 # This file
└── PRODUCT_SPEC.md           # Authoritative data models and feature scope
```

---

## ADK Agent Architecture

```
director_agent (root)
├── story_parser_agent     → INPUT: raw_text  OUTPUT: StoryPack JSON
├── world_generator_agent  → INPUT: StoryPack OUTPUT: WorldMap + BranchNodes
└── character_agent        → INPUT: Character  OUTPUT: Live API streaming session
```

**Rules:**
- ALL Gemini calls must go through ADK Agent — never call `genai.generate_content()` directly
- `director_agent` is the only agent exposed to FastAPI routes
- Each agent must define its output schema as a Pydantic model

---

## Data Contract

Frontend and backend share one truth: the TypeScript interfaces in `PRODUCT_SPEC.md` section 4.

- `frontend/lib/types/` mirrors these interfaces exactly
- `backend/` uses Pydantic models that match the same field names
- **Never invent fields** not in PRODUCT_SPEC.md without updating the spec first

---

## API Convention

- All backend routes: `POST/GET /api/v1/{resource}`
- Streaming responses use Server-Sent Events (`text/event-stream`)
- Live API (character dialogue) uses WebSocket at `/ws/character/{session_id}`
- Response envelope: `{ "data": ..., "error": null }` or `{ "data": null, "error": "message" }`

---

## Environment Variables

```bash
# backend/.env
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_GENAI_USE_VERTEXAI=true

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Never** hardcode keys in frontend code. Never commit `.env` files.

---

## Development Rules

1. **Commit after every working feature** — hackathon safety net
2. Run type-check before committing: `cd frontend && npx tsc --noEmit`
3. shadcn/ui components go in `components/ui/` — do not edit generated files
4. Firestore collections: `story_packs`, `sessions`, `characters`, `scenes`
5. If a feature is outside MVP scope in PRODUCT_SPEC.md, skip it — no gold-plating

---

## Quick Start

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm install
npm run dev
```

---

## MCP Servers (optional, enable if needed)

- **Google Maps MCP** — if story world needs real geography
- **BigQuery MCP** — if demoing user journey analytics to judges

Configured in `~/.claude/mcp_settings.json` per Claude Code docs.
