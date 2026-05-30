# Frontend (`@todo-app/frontend`)

React + Vite + TypeScript single-page app for the Todo application: list, add,
toggle, inline-edit, delete and filter todos, with loading / empty / error states.
Built in **T3 (PUN-9)** against the **T2 (PUN-8)** REST API contract.

## Scripts

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the Vite dev server (port 5173)      |
| `npm run build`     | Type-check then produce a production build |
| `npm run preview`   | Preview the production build locally       |
| `npm run typecheck` | Type-check without emitting                |

## Configuration

| Env var        | Default   | Description                                                            |
| -------------- | --------- | ---------------------------------------------------------------------- |
| `VITE_API_URL` | _(empty)_ | Base URL of the backend API. Leave empty to use relative `/api` paths. |

During development `/api/*` and `/health` are proxied to the backend on
`http://localhost:3000` (see `vite.config.ts`), so `VITE_API_URL` can stay
empty. Set it (e.g. `VITE_API_URL=https://api.example.com`) when the API lives
on a different origin in production.

## Structure

```
src/
├── api.ts              Typed REST client (matches the T2 contract)
├── types.ts            Todo / Filter domain types
├── hooks/useTodos.ts   Todo state + load/create/update/delete
└── components/
    ├── TodoApp.tsx     Top-level: owns state, composes the UI
    ├── AddTodo.tsx     Input + button (empty-title guard)
    ├── Filters.tsx     All / Active / Completed
    ├── TodoList.tsx    List + empty state
    └── TodoItem.tsx    Row: toggle, inline edit, delete
```

## API contract

The client talks to:

- `GET /api/todos?completed=true|false` — list
- `POST /api/todos` `{ title }` — create
- `PATCH /api/todos/:id` `{ title?, completed? }` — update
- `DELETE /api/todos/:id` — delete

`Todo = { id, title, completed, createdAt, updatedAt }`.
