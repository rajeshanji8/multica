/**
 * Shared test fixtures and UI helpers.
 *
 * `test` here is the standard Playwright `test` extended so that every test
 * starts from an empty todo list. The backend uses an in-memory DB, but the
 * process is shared across the run, so we wipe all todos through the public
 * API before each test to keep them independent and deterministic.
 */

import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import type { Todo } from './types';

/** Delete every todo via the REST API (used to reset state between tests). */
export async function clearAllTodos(request: APIRequestContext): Promise<void> {
  const res = await request.get('/api/todos');
  if (!res.ok()) return;
  const todos = (await res.json()) as Todo[];
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
}

/** Seed a todo directly through the API and return it. */
export async function seedTodo(
  request: APIRequestContext,
  title: string,
  completed = false,
): Promise<Todo> {
  const created = await request.post('/api/todos', { data: { title } });
  expect(created.status()).toBe(201);
  let todo = (await created.json()) as Todo;
  if (completed) {
    const updated = await request.patch(`/api/todos/${todo.id}`, { data: { completed: true } });
    expect(updated.ok()).toBeTruthy();
    todo = (await updated.json()) as Todo;
  }
  return todo;
}

export const test = base.extend<{ cleanState: void }>({
  // Auto-applied to every test: wipe todos before the body runs.
  cleanState: [
    async ({ request }, use) => {
      await clearAllTodos(request);
      await use();
    },
    { auto: true },
  ],
});

export { expect };

// ---------------------------------------------------------------------------
// UI helpers — small wrappers around the locators so specs read declaratively.
// ---------------------------------------------------------------------------

export const ui = {
  newTodoInput: (page: Page) => page.getByPlaceholder('What needs to be done?'),
  addButton: (page: Page) => page.getByRole('button', { name: 'Add', exact: true }),
  /** A single todo row, located by its (unique) title text. */
  item: (page: Page, title: string) => page.locator('li.todo', { hasText: title }),
  allItems: (page: Page) => page.locator('li.todo'),
  emptyState: (page: Page) => page.locator('.empty-state'),
  errorAlert: (page: Page) => page.locator('.status--error'),
  filterButton: (page: Page, label: 'All' | 'Active' | 'Completed') =>
    page.getByRole('group', { name: 'Filter todos' }).getByRole('button', { name: label }),
};

/** Add a todo through the UI and wait for it to show up in the list. */
export async function addTodo(page: Page, title: string): Promise<void> {
  await ui.newTodoInput(page).fill(title);
  await ui.addButton(page).click();
  await expect(ui.item(page, title)).toBeVisible();
}
