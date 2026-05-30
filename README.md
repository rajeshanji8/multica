# Todo App

A simple, fully-working todo application: a React + Vite frontend talking to an Express +
SQLite backend over a small REST/JSON API, organized as an **npm-workspaces monorepo**.

> **Status:** scaffolding (T1). The backend and frontend currently ship placeholder apps so
> the whole thing installs, builds, and runs end to end. Real functionality lands in the
> follow-up tasks below.

## Architecture

```
todo-app/
├── backend/      Express REST API (TypeScript) + SQLite   → @todo-app/backend
├── frontend/     React + Vite SPA (TypeScript)            → @todo-app/frontend
├── tsconfig.base.json   shared TypeScript compiler options
├── eslint.config.mjs    shared ESLint (flat) config
└── package.json         npm workspaces + root scripts
```

Browser → REST/JSON over HTTP → Backend API → SQLite. Stateless API, single source of
truth in SQLite.

## Prerequisites

- **Node.js 20+** (see [`.nvmrc`](./.nvmrc) — run `nvm use`).
- **npm 9+** (ships with Node 20; provides workspaces support).

## Getting started

```bash
git clone https://github.com/rajeshanji8/multica.git
cd multica
npm install          # installs all workspaces
npm run dev          # runs backend (:3000) + frontend (:5173) together
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:3000/health

During development the frontend proxies `/api/*` and `/health` to the backend, so the SPA
can call the API without CORS configuration.

## Root scripts

| Script                 | Description                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | Run backend + frontend together (via `concurrently`)                |
| `npm run build`        | Build both workspaces                                               |
| `npm run typecheck`    | Type-check every workspace                                          |
| `npm run lint`         | Lint the whole repo (ESLint)                                        |
| `npm run lint:fix`     | Lint and auto-fix                                                   |
| `npm run format`       | Format the repo with Prettier                                       |
| `npm run format:check` | Check formatting without writing                                    |
| `npm run verify`       | Format check + lint + typecheck + build (the single green/red gate) |

You can also target a single workspace, e.g. `npm run dev --workspace backend`.

## Tooling

- **Language:** TypeScript 5 (shared base config in `tsconfig.base.json`).
- **Lint/format:** ESLint 9 (flat config) + Prettier, shared across packages.
- **Dev orchestration:** `concurrently` runs both apps from one command.

## Roadmap

| Task                    | Description                               |
| ----------------------- | ----------------------------------------- |
| **T1** (PUN-7) — _this_ | Scaffolding & repo structure              |
| **T2** (PUN-8)          | Backend REST API (Express + SQLite + Zod) |
| **T3** (PUN-9)          | Frontend UI (React)                       |
| **T4** (PUN-10)         | Integration, Docker packaging & docs      |
| **T5** (PUN-11)         | Test automation scripts & git hooks       |
| **T6** (PUN-12)         | End-to-end tests (Playwright)             |
| **T7** (PUN-13)         | CI pipeline (GitHub Actions)              |
| **T8** (PUN-14)         | Deployment automation (CD)                |

## API contract (target)

- `GET /api/todos?completed=` · `POST /api/todos`
- `GET /api/todos/:id` · `PATCH /api/todos/:id` · `DELETE /api/todos/:id`
- `GET /health`

Todo shape: `{ id, title, completed, createdAt, updatedAt }`
