# Todo App

A simple, fully-working todo application: a **React + Vite** frontend talking to an
**Express + SQLite** backend over a small REST/JSON API, organized as an
**npm-workspaces monorepo** and shippable as a single `docker compose up`.

Create, toggle, edit, delete and filter todos. Data persists in SQLite on a Docker volume.

## Quick start (Docker)

The fastest path from clone to running — only Docker required:

```bash
git clone https://github.com/rajeshanji8/multica.git
cd multica
docker compose up --build
```

Then open **http://localhost:8080**.

- The frontend (nginx) serves the built SPA and reverse-proxies `/api/*` and `/health`
  to the backend, so the browser only ever talks to one origin (no CORS to configure).
- Todos are stored in SQLite on the named `todo-data` volume, so they **survive**
  `docker compose down` and restarts. Run `docker compose down -v` to wipe the data.
- Optionally `cp .env.example .env` to change the published port (`FRONTEND_PORT`).

Run `docker compose up --build -d` to start detached; `docker compose logs -f` to tail logs.

### Smoke test

With the stack running, verify the full flow (create → toggle → delete) end-to-end
against the containers — exercising the same path the UI uses (nginx → backend → SQLite):

```bash
npm run smoke            # targets http://localhost:8080 by default
# or: BASE_URL=http://localhost:8080 node scripts/smoke-test.mjs
```

## Prerequisites

| To run...         | You need                                                          |
| ----------------- | ----------------------------------------------------------------- |
| via Docker        | Docker + Docker Compose v2 (`docker compose`)                     |
| local dev / build | **Node.js 20+** (see [`.nvmrc`](./.nvmrc) — `nvm use`) and npm 9+ |

## Local development (no Docker)

```bash
npm install          # installs all workspaces + git hooks
npm run dev          # backend on :3000, frontend on :5173, together
```

- Frontend (dev): http://localhost:5173
- Backend health: http://localhost:3000/health

The Vite dev server proxies `/api/*` and `/health` to the backend, so the SPA calls the
API without CORS. Each app can also run on its own: `npm run dev --workspace backend`.

## Configuration (environment variables)

| Variable        | Used by  | Default                                      | Description                                                          |
| --------------- | -------- | -------------------------------------------- | -------------------------------------------------------------------- |
| `PORT`          | backend  | `3000`                                       | Port the API listens on.                                             |
| `DB_PATH`       | backend  | `todos.db` (dev) / `/data/todos.db` (Docker) | SQLite file path; `:memory:` for an ephemeral DB.                    |
| `CORS_ORIGIN`   | backend  | `http://localhost:5173`                      | Allowed browser origin. Unused behind the nginx proxy (same origin). |
| `VITE_API_URL`  | frontend | _(empty)_                                    | API base URL at build time. Empty = relative `/api` paths (proxied). |
| `FRONTEND_PORT` | compose  | `8080`                                       | Host port the app is published on.                                   |

## API reference

Base path `/api`. A todo is `{ id, title, completed, createdAt, updatedAt }`
(`id` is a UUID; timestamps are ISO-8601 strings).

| Method   | Path                    | Body                     | Success    | Notes                                    |
| -------- | ----------------------- | ------------------------ | ---------- | ---------------------------------------- |
| `GET`    | `/health`               | —                        | `200`      | `{ status: "ok", service: ... }`         |
| `GET`    | `/api/todos?completed=` | —                        | `200` `[]` | Optional `completed=true`/`false` filter |
| `POST`   | `/api/todos`            | `{ title, completed? }`  | `201` todo | `title`: 1–500 chars                     |
| `GET`    | `/api/todos/:id`        | —                        | `200` todo | `404` if not found                       |
| `PATCH`  | `/api/todos/:id`        | `{ title?, completed? }` | `200` todo | At least one field required              |
| `DELETE` | `/api/todos/:id`        | —                        | `204`      | `404` if not found                       |

Errors return JSON: `{ error, message }` or, for invalid input,
`{ error: "ValidationError", details: [{ path, message }] }` with status `400`.

```bash
# examples (against the running stack)
curl http://localhost:8080/api/todos
curl -X POST http://localhost:8080/api/todos -H 'Content-Type: application/json' -d '{"title":"buy milk"}'
curl -X PATCH http://localhost:8080/api/todos/<id> -H 'Content-Type: application/json' -d '{"completed":true}'
curl -X DELETE http://localhost:8080/api/todos/<id>
```

## Project structure

```
todo-app/
├── backend/            Express REST API (TypeScript) + SQLite  → @todo-app/backend
│   ├── src/            app, routes, repository, schemas, db, config
│   └── Dockerfile      multi-stage prod build (deps → build → slim runtime)
├── frontend/           React + Vite SPA (TypeScript)           → @todo-app/frontend
│   ├── src/            components, hooks, api client
│   ├── nginx.conf      static serving + /api & /health proxy
│   └── Dockerfile      Vite build → nginx static serve
├── scripts/
│   └── smoke-test.mjs  end-to-end create→toggle→delete check
├── docker-compose.yml  backend + frontend + persistent SQLite volume
├── tsconfig.base.json  shared TypeScript compiler options
├── eslint.config.mjs   shared ESLint (flat) config
└── package.json        npm workspaces + root scripts
```

Browser → REST/JSON over HTTP → Backend API → SQLite (single source of truth).

## Root scripts

| Script                | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| `npm run dev`         | Run backend + frontend together (via `concurrently`)                |
| `npm run build`       | Build both workspaces                                               |
| `npm run typecheck`   | Type-check every workspace                                          |
| `npm run lint`        | Lint the whole repo (ESLint) — `lint:fix` to auto-fix               |
| `npm run format`      | Format with Prettier — `format:check` to verify only                |
| `npm run test`        | Run unit/integration tests across workspaces                        |
| `npm run test:e2e`    | Run the end-to-end (Playwright) suite (added in T6)                 |
| `npm run verify`      | Format check + lint + typecheck + test + build — the green/red gate |
| `npm run smoke`       | End-to-end smoke test against the running containers                |
| `npm run docker:up`   | `docker compose up --build -d`                                      |
| `npm run docker:down` | `docker compose down`                                               |

## Git hooks

Managed by [husky](https://typicode.github.io/husky/), installed automatically on
`npm install` (via `prepare`). `pre-commit` runs `lint-staged` (ESLint `--fix` +
Prettier) and typecheck; `pre-push` runs the tests. Bypass in an emergency with
`--no-verify`.

## Roadmap

| Task            | Description                               | Status   |
| --------------- | ----------------------------------------- | -------- |
| **T1** (PUN-7)  | Scaffolding & repo structure              | done     |
| **T2** (PUN-8)  | Backend REST API (Express + SQLite + Zod) | done     |
| **T3** (PUN-9)  | Frontend UI (React)                       | done     |
| **T4** (PUN-10) | Integration, Docker packaging & docs      | _this_   |
| **T5** (PUN-11) | Test automation scripts & git hooks       | done     |
| **T6** (PUN-12) | End-to-end tests (Playwright)             | upcoming |
| **T7** (PUN-13) | CI pipeline (GitHub Actions)              | upcoming |
| **T8** (PUN-14) | Deployment automation (CD)                | upcoming |
