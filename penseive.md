# Pensieve — Codebase Intelligence Tool

> "One simply siphons the excess thoughts from one's mind, pours them into the basin, and examines them at one's leisure." — *adapted for code*

Pensieve lets you pour a codebase into a graph, and examine its memories — dependencies, structure, and history — at your leisure. It connects to GitHub, parses code into an AST-backed dependency graph, and layers LLM-powered review and natural-language querying on top.

---

## 1. Concept

Most code review tools look at a diff in isolation. Pensieve instead builds a **graph of the codebase** (files, functions, classes, and how they call/import/inherit from each other) and uses that graph as context — for PR review, for breaking-change detection, and for answering plain-English questions about the code.

Two layers, cleanly split:

- **Web Dev Layer** — auth, ingestion, parsing, graph storage, visualization. The "plumbing."
- **Gen AI Layer** — LLM-powered review, breaking-change analysis, NL2Cypher. Sits on top of the graph; useless without it.

---

## 2. Tech Stack

### Web Dev Layer

**Frontend**
- React (Vite) + TypeScript
- Tailwind CSS
- D3.js — force-directed dependency graph
- TanStack Query — data fetching/caching
- Axios

**Backend**
- Node.js + Express + TypeScript
- Passport.js (`passport-github2`) — GitHub OAuth
- `@octokit/rest` — GitHub API (repos, PRs, webhooks)
- `node-tree-sitter` / `web-tree-sitter` — AST parsing
- `neo4j-driver` — official Neo4j Node driver
- `ignore` (npm) — `.gitignore` parsing
- JWT — sessions
- Zod — validation

**Database**
- Neo4j — the graph itself (File / Function / Class nodes; IMPORTS / CALLS / INHERITS edges)
- Redis + BullMQ (Phase 4+) — async webhook job queue

**Infra**
- Docker + docker-compose (local: server + client + Neo4j + Redis)
- GitHub Webhooks — push/PR triggers
- Deployment target: Neo4j Aura (managed) + Render/Railway (backend) + Vercel (frontend)

### Gen AI Layer

- LangChain.js — orchestration for review, NL2Cypher
- `@anthropic-ai/sdk` — direct Claude API calls
- BYOK (Bring Your Own Key) — key lives in frontend localStorage, sent per-request, never persisted server-side
- Zod — structured output validation for LLM responses
- `tiktoken` (or equivalent) — token counting / context truncation before LLM calls

**Boundary point:** Neo4j is written by the Web Dev layer and read by the Gen AI layer. That's the only real coupling.

---

## 3. Architecture Overview

```
                    ┌─────────────────────┐
                    │   GitHub (OAuth +    │
                    │   Webhooks + API)     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Express Backend     │
                    │  ─────────────────    │
                    │  Auth (Passport)       │
                    │  Repo/PR fetch (Octokit)│
                    │  AST parse (tree-sitter)│
                    └──────────┬───────────┘
                               │ writes
                    ┌──────────▼───────────┐
                    │       Neo4j           │
                    │  File/Fn/Class nodes  │
                    │  CALLS/IMPORTS edges  │
                    └──────────┬───────────┘
                               │ reads
              ┌────────────────┼────────────────┐
              │                                  │
   ┌──────────▼──────────┐         ┌────────────▼────────────┐
   │   React + D3.js UI   │         │   Gen AI Layer (LangChain)│
   │   Graph visualization │         │   PR review / NL2Cypher  │
   └───────────────────────┘         │   Breaking-change detect │
                                      └───────────────────────────┘
```

---

## 4. Neo4j Graph Schema (initial)

**Nodes**
- `File {path, language, lastModified}`
- `Function {name, startLine, endLine, signature}`
- `Class {name, startLine, endLine}`

**Relationships**
- `(File)-[:CONTAINS]->(Function)`
- `(File)-[:CONTAINS]->(Class)`
- `(File)-[:IMPORTS]->(File)`
- `(Function)-[:CALLS]->(Function)`
- `(Class)-[:INHERITS]->(Class)`

This will evolve once real parsing starts surfacing edge cases (e.g. dynamic imports, re-exports).

---

## 5. Roadmap (Phased)

### Phase 1 — Core Ingestion (current focus)
- [ ] Project scaffold (`/server`, `/client`, Docker compose with Neo4j)
- [ ] Manual PR URL input → fetch diff + changed files via Octokit (public repos, no OAuth needed yet)
- [ ] `.gitignore` + extension whitelist + file size filtering
- [ ] tree-sitter parsing for changed files (start with JS/TS only)

### Phase 2 — Graph Construction
- [ ] Neo4j schema implementation
- [ ] Push parsed AST → Neo4j
- [ ] Validate with manual Cypher queries

### Phase 3 — Gen AI Vertical Slice
- [ ] BYOK key input (frontend, localStorage)
- [ ] LangChain.js chain: diff + graph context → Claude → structured review
- [ ] Display review output in a minimal UI

### Phase 4 — Visualization
- [ ] React + D3.js force graph
- [ ] Filter/search by file, function, dependency depth

### Phase 5 — Auth + Webhooks
- [ ] GitHub OAuth (Passport)
- [ ] Webhook auto-registration on repo connect (requires admin access on target repo)
- [ ] BullMQ background processing for push events → incremental re-parse

### Phase 6 — Advanced Gen AI
- [ ] Breaking-change detection (graph diff between commits → LLM summary)
- [ ] NL2Cypher (schema-aware prompt → Cypher → execute → return results, with retry on malformed queries)

### Phase 7 — Deployment
- [ ] Dockerize for prod
- [ ] Neo4j Aura + Render/Railway + Vercel
- [ ] Env/secrets management, prod webhook URLs
- [ ] Basic logging/monitoring

---

## 6. Design Theme — "Pensieve" (Harry Potter–inspired, not literal)

To avoid copyright/trademark issues with Warner Bros. IP, the theme draws **inspiration** from the Pensieve concept without using actual licensed assets (house crests, specific character likenesses, exact iconography from the films/books).

**Palette**
- Background: deep navy / charcoal (`#0D1117`–`#1A1A2E` range)
- Accent: gold / bronze (`#C9A86A` range) — parchment-and-ink feel
- Secondary: soft silver-grey for muted text/borders

**Typography**
- Headers: serif (old-book feel)
- Body: clean sans-serif for readability

**In-app naming (original)**
- Graph view → "The Pensieve"
- Search/query bar → "Recall" or "Summon"
- PR review output → "Reading"
- Loading state → subtle swirling-mist animation (original asset, not copied)

---

## 7. Security & Cost Guardrails

- BYOK: API keys never touch the backend's persistent storage
- Token/context limits enforced before any LLM call (truncate large diffs)
- File filtering at ingestion (`.gitignore`, extension whitelist, size caps) — prevents both token abuse and graph bloat
- Public-repo-only access works without OAuth; private repo features require explicit GitHub permission scopes the user already has

---

## 8. Open Questions / Decisions Pending

- Which languages beyond JS/TS to support for tree-sitter parsing (Python likely next)
- Whether MongoDB/Postgres is needed alongside Neo4j for lightweight metadata (users, repo configs) or if Neo4j alone suffices
- Production Neo4j hosting: Aura managed vs. self-hosted container