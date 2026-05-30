# Frontend (`@todo-app/frontend`)

React + Vite + TypeScript single-page app for the Todo application. The full UI (CRUD,
toggle, inline edit, filters, loading/empty/error states) is built in **T3 (PUN-9)**; this
package currently renders a placeholder so the monorepo builds and `npm run dev` works.

## Scripts

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the Vite dev server (port 5173)      |
| `npm run build`     | Type-check then produce a production build |
| `npm run preview`   | Preview the production build locally       |
| `npm run typecheck` | Type-check without emitting                |

During development `/api/*` and `/health` are proxied to the backend on
`http://localhost:3000` (see `vite.config.ts`).
