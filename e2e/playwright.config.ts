import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the todo-app end-to-end suite.
 *
 * The tests drive the real React UI (Vite dev server on :5173), which proxies
 * `/api/*` to the real Express backend (:3000). The backend is booted with an
 * in-memory SQLite database (`DB_PATH=:memory:`) so every run starts from a
 * clean, deterministic state; tests further isolate themselves by wiping all
 * todos through the public API before each test (see tests/fixtures.ts).
 *
 * Both servers are started automatically via `webServer`, so a bare
 * `npm run test:e2e` boots everything and runs headless with zero setup.
 *
 * Dedicated ports (3100 / 4173) are used instead of the dev defaults
 * (3000 / 5173) so the suite is hermetic and never collides with — or reuses —
 * a `npm run dev` server you may already have running.
 */

const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT ?? 4173);
const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT ?? 3100);
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${FRONTEND_PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // Fail the build on CI if test.only is accidentally left in the source.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Tests share one backend + DB and isolate via per-test cleanup, so run them
  // serially to keep the shared state deterministic.
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Boot the real backend (in-memory DB) and the real frontend before the
  // suite. Commands run from the repo root so the npm workspace flags resolve.
  webServer: [
    {
      command: 'npm run dev --workspace backend',
      cwd: '..',
      port: BACKEND_PORT,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        PORT: String(BACKEND_PORT),
        // Ephemeral DB → a clean slate on every boot.
        DB_PATH: ':memory:',
      },
    },
    {
      // Vite dev server on a dedicated port, proxying /api to our backend.
      command: `npm run dev --workspace frontend -- --port ${FRONTEND_PORT} --strictPort`,
      cwd: '..',
      port: FRONTEND_PORT,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        BACKEND_URL,
      },
    },
  ],
});
