# End-to-end tests (`@todo-app/e2e`)

[Playwright](https://playwright.dev) tests that drive the **real React UI**
against the **real Express + SQLite API** — the automated replacement for
manual click-through testing.

## What it covers

The core MVP user journeys, each asserted against observable UI:

- **Add** a todo → it appears in the list (+ empty-title guard).
- **Toggle complete** → checkbox + row styling update and **persist across reload**.
- **Inline edit** a title → persists across reload (+ Escape cancels).
- **Delete** a todo → removed (and stays removed after reload).
- **Filter** All / Active / Completed → correct subsets and live counts.
- **Empty state** messages (per filter) and **error handling** with a working Retry.

## How it runs

`playwright.config.ts` boots both servers automatically via `webServer`:

- **Backend** on `:3100` with `DB_PATH=:memory:` → a clean DB on every run.
- **Frontend** (Vite dev) on `:4173`, which proxies `/api/*` to the backend.

Dedicated ports (not the `3000`/`5173` dev defaults) keep the suite hermetic — it
never collides with or reuses a `npm run dev` server you may have running.

Tests run **headless** and **serially** (`workers: 1`) against this shared
backend; each test first wipes all todos through the public API
(`tests/fixtures.ts`) so they stay independent and deterministic.

Failures capture a **trace**, **screenshot** and **video**; an **HTML report**
is always generated under `e2e/playwright-report/`.

## Commands

Run from the repo root (or this directory):

```bash
# one-time: install the Chromium browser Playwright drives
npm run install:browsers --workspace e2e   # = playwright install --with-deps chromium

npm run test:e2e            # root script → runs this suite headless (boots servers)
npm run test:e2e --workspace e2e   # same, scoped to this workspace
npm run report --workspace e2e     # open the last HTML report
```

The servers are started for you, so you do **not** need a running `npm run dev`
or `docker compose` — though if one is already running on the same ports it is
reused locally (`reuseExistingServer`).

## Configuration

| Env var             | Default                 | Purpose                          |
| ------------------- | ----------------------- | -------------------------------- |
| `E2E_BASE_URL`      | `http://localhost:4173` | Frontend origin the tests target |
| `E2E_FRONTEND_PORT` | `4173`                  | Port Playwright waits on / boots |
| `E2E_BACKEND_PORT`  | `3100`                  | Backend port (in-memory DB)      |
| `CI`                | _(unset)_               | Enables retries + `forbidOnly`   |
