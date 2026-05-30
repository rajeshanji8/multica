#!/usr/bin/env node
/**
 * End-to-end smoke test for the containerised todo app.
 *
 * Exercises the exact path the UI uses in production: the browser-facing
 * frontend origin (nginx) which reverse-proxies /api to the backend, which
 * persists to SQLite. Runs the core flow create -> toggle -> delete and
 * asserts the observable result at each step.
 *
 * Usage:
 *   node scripts/smoke-test.mjs                 # default http://localhost:8080
 *   BASE_URL=http://localhost:8080 node scripts/smoke-test.mjs
 *
 * Requires the stack to be up (e.g. `docker compose up --build -d`).
 * Exits 0 on success, non-zero on the first failed assertion.
 */

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 60000);

function log(step, msg) {
  console.log(`✓ ${step}: ${msg}`);
}

function fail(step, msg) {
  console.error(`✗ ${step}: ${msg}`);
  process.exit(1);
}

async function http(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

/** Poll the frontend + backend until both respond, or time out. */
async function waitForReady() {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastErr = 'unknown error';
  while (Date.now() < deadline) {
    try {
      const health = await http('GET', '/health');
      const list = await http('GET', '/api/todos');
      if (health.status === 200 && list.status === 200) {
        return;
      }
      lastErr = `health=${health.status} todos=${list.status}`;
    } catch (err) {
      lastErr = err.message;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  fail('ready', `stack not reachable at ${BASE_URL} within ${TIMEOUT_MS}ms (${lastErr})`);
}

async function main() {
  console.log(`Smoke testing ${BASE_URL}`);
  await waitForReady();
  log('ready', 'frontend proxy + backend /health responding');

  const title = `smoke-test ${new Date().toISOString()}`;

  // CREATE
  const created = await http('POST', '/api/todos', { title });
  if (created.status !== 201) fail('create', `expected 201, got ${created.status}`);
  const id = created.data?.id;
  if (!id) fail('create', `no id in response: ${JSON.stringify(created.data)}`);
  if (created.data.title !== title) fail('create', 'title mismatch');
  if (created.data.completed !== false) fail('create', 'new todo should be incomplete');
  log('create', `created todo ${id}`);

  // TOGGLE (complete)
  const toggled = await http('PATCH', `/api/todos/${id}`, { completed: true });
  if (toggled.status !== 200) fail('toggle', `expected 200, got ${toggled.status}`);
  if (toggled.data.completed !== true) fail('toggle', 'completed should be true');
  log('toggle', 'marked complete');

  // VERIFY persisted via a fresh read
  const fetched = await http('GET', `/api/todos/${id}`);
  if (fetched.status !== 200 || fetched.data.completed !== true) {
    fail('verify', `re-read did not reflect toggle: ${JSON.stringify(fetched.data)}`);
  }
  log('verify', 'toggle persisted across a fresh read');

  // DELETE
  const removed = await http('DELETE', `/api/todos/${id}`);
  if (removed.status !== 204) fail('delete', `expected 204, got ${removed.status}`);
  const gone = await http('GET', `/api/todos/${id}`);
  if (gone.status !== 404) fail('delete', `expected 404 after delete, got ${gone.status}`);
  log('delete', 'todo deleted and no longer found');

  console.log('\nSMOKE TEST PASSED — create → toggle → delete all green.');
}

main().catch((err) => {
  fail('error', err.stack ?? String(err));
});
