import { test, expect, ui, addTodo } from './fixtures';

test.describe('Todo CRUD journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // The list finishes loading (empty state, since each test starts clean).
    await expect(ui.emptyState(page)).toBeVisible();
  });

  test('add a todo → it appears in the list', async ({ page }) => {
    await addTodo(page, 'Buy milk');

    await expect(ui.allItems(page)).toHaveCount(1);
    await expect(ui.item(page, 'Buy milk')).toBeVisible();
    // Header subtitle reflects the new active count.
    await expect(page.locator('.app__subtitle')).toContainText('1 active');
    // Input is cleared and ready for the next entry.
    await expect(ui.newTodoInput(page)).toHaveValue('');
  });

  test('empty title is rejected with an inline error', async ({ page }) => {
    await ui.newTodoInput(page).fill('   ');
    await ui.addButton(page).click();

    await expect(page.locator('.add-todo__error')).toHaveText('Please enter a title.');
    await expect(ui.allItems(page)).toHaveCount(0);
  });

  test('toggle complete → styling updates and persists across reload', async ({ page }) => {
    await addTodo(page, 'Walk the dog');
    const item = ui.item(page, 'Walk the dog');
    const checkbox = item.getByRole('checkbox');

    await expect(checkbox).not.toBeChecked();
    await expect(item).not.toHaveClass(/todo--completed/);

    // Click (not .check()): the checkbox is controlled and only flips once the
    // backend update resolves, so we assert the result rather than the act.
    await checkbox.click();

    await expect(checkbox).toBeChecked();
    await expect(item).toHaveClass(/todo--completed/);
    await expect(page.locator('.app__subtitle')).toContainText('1 completed');

    // Persists after a full reload (state lives in the backend, not the UI).
    await page.reload();
    const reloaded = ui.item(page, 'Walk the dog');
    await expect(reloaded.getByRole('checkbox')).toBeChecked();
    await expect(reloaded).toHaveClass(/todo--completed/);

    // And toggling back to active works too.
    await reloaded.getByRole('checkbox').click();
    await expect(reloaded.getByRole('checkbox')).not.toBeChecked();
    await expect(reloaded).not.toHaveClass(/todo--completed/);
  });

  test('inline edit a title → persists across reload', async ({ page }) => {
    await addTodo(page, 'By milk');

    const item = ui.item(page, 'By milk');
    await item.getByRole('button', { name: 'Edit "By milk"' }).click();

    const editInput = page.getByRole('textbox', { name: 'Edit todo title' });
    await expect(editInput).toBeFocused();
    await editInput.fill('Buy milk');
    await editInput.press('Enter');

    // Old title is gone, new title is shown.
    await expect(ui.item(page, 'Buy milk')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Edit todo title' })).toHaveCount(0);

    await page.reload();
    await expect(ui.item(page, 'Buy milk')).toBeVisible();
    await expect(ui.allItems(page)).toHaveCount(1);
  });

  test('escape cancels an inline edit', async ({ page }) => {
    await addTodo(page, 'Keep this title');

    await ui
      .item(page, 'Keep this title')
      .getByRole('button', { name: 'Edit "Keep this title"' })
      .click();
    const editInput = page.getByRole('textbox', { name: 'Edit todo title' });
    await editInput.fill('Discarded title');
    await editInput.press('Escape');

    await expect(ui.item(page, 'Keep this title')).toBeVisible();
    await expect(page.locator('li.todo')).toHaveCount(1);
  });

  test('delete a todo → it is removed from the list', async ({ page }) => {
    await addTodo(page, 'Throwaway task');
    await expect(ui.allItems(page)).toHaveCount(1);

    await ui
      .item(page, 'Throwaway task')
      .getByRole('button', { name: 'Delete "Throwaway task"' })
      .click();

    await expect(ui.item(page, 'Throwaway task')).toHaveCount(0);
    await expect(ui.emptyState(page)).toBeVisible();

    // Deletion is durable.
    await page.reload();
    await expect(ui.emptyState(page)).toBeVisible();
  });
});
