# Backend (`@todo-app/backend`)

Express + TypeScript REST API for the Todo app, with SQLite persistence via
`better-sqlite3` (file-based, zero-config) and request validation via `zod`.

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server with hot reload |
| `npm run build`      | Compile TypeScript to `dist/`        |
| `npm run start`      | Run the compiled server              |
| `npm run typecheck`  | Type-check without emitting          |
| `npm run test`       | Run the Vitest + supertest suite     |
| `npm run test:watch` | Run tests in watch mode              |

## Configuration

All settings have sensible defaults, so the server runs zero-config.

| Env var       | Default                 | Description                           |
| ------------- | ----------------------- | ------------------------------------- |
| `PORT`        | `3000`                  | HTTP port                             |
| `DB_PATH`     | `todos.db`              | SQLite file path (`:memory:` for RAM) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin (Vite dev)     |

## API contract

Todo shape: `{ id, title, completed, createdAt, updatedAt }`

| Method   | Path                    | Body                     | Success    |
| -------- | ----------------------- | ------------------------ | ---------- |
| `GET`    | `/api/todos?completed=` | —                        | `200` list |
| `POST`   | `/api/todos`            | `{ title }`              | `201` todo |
| `GET`    | `/api/todos/:id`        | —                        | `200` todo |
| `PATCH`  | `/api/todos/:id`        | `{ title?, completed? }` | `200` todo |
| `DELETE` | `/api/todos/:id`        | —                        | `204`      |
| `GET`    | `/health`               | —                        | `200`      |

Validation failures return `400` with `{ error: "ValidationError", details }`;
unknown ids return `404` with `{ error: "NotFound" }`.
