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
| `npm run test`         | Run unit/integration tests across workspaces                        |
| `npm run test:e2e`     | Run the end-to-end (Playwright) suite                               |
| `npm run verify`       | Format check + lint + typecheck + test + build — the green/red gate |

You can also target a single workspace, e.g. `npm run dev --workspace backend`.

`test` and `test:e2e` delegate to each workspace with `--workspaces --if-present`,
so they pass quietly until the test suites land (T2/T3 add unit/integration tests;
T6 adds the Playwright `test:e2e` script). Any failing workspace makes the script
exit non-zero, so `npm run verify`, the git hooks, and CI all turn red on a bad change.

## Git hooks

Hooks are managed by [husky](https://typicode.github.io/husky/) and install
automatically on `npm install` (via the `prepare` script). No manual setup needed.

| Hook         | Runs                                                                  |
| ------------ | --------------------------------------------------------------------- |
| `pre-commit` | `lint-staged` (ESLint `--fix` + Prettier on staged files) + typecheck |
| `pre-push`   | `npm run test`                                                        |

To bypass in an emergency, use `git commit --no-verify` / `git push --no-verify`.

## Tooling

- **Language:** TypeScript 5 (shared base config in `tsconfig.base.json`).
- **Lint/format:** ESLint 9 (flat config) + Prettier, shared across packages.
- **Dev orchestration:** `concurrently` runs both apps from one command.
- **Quality gates:** husky + lint-staged guard commits/pushes; `npm run verify` is the one-shot check.

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
