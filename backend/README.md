# Backend (`@todo-app/backend`)

Express + TypeScript REST API for the Todo app. Persistence (SQLite via `better-sqlite3`)
and the full CRUD endpoints are implemented in **T2 (PUN-8)**; this package currently
ships a placeholder server with a `/health` route so the monorepo builds and `npm run dev`
works end to end.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server with hot reload |
| `npm run build`     | Compile TypeScript to `dist/`        |
| `npm run start`     | Run the compiled server              |
| `npm run typecheck` | Type-check without emitting          |

Default port: `3000` (override with `PORT`).

## Planned API contract (T2)

- `GET /api/todos?completed=` · `POST /api/todos`
- `GET /api/todos/:id` · `PATCH /api/todos/:id` · `DELETE /api/todos/:id`
- `GET /health`

Todo shape: `{ id, title, completed, createdAt, updatedAt }`
