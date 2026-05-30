import { test, expect, ui, addTodo } from './fixtures';

test.describe('Empty state', () => {
  test('shows a friendly empty message when there are no todos', async ({ page }) => {
    await page.goto('/');
    await expect(ui.emptyState(page)).toHaveText('No todos yet. Add your first one above.');
    await expect(ui.allItems(page)).toHaveCount(0);
    // No subtitle until at least one todo exists.
    await expect(page.locator('.app__subtitle')).toHaveCount(0);
  });

  test('each filter has its own empty message', async ({ page }) => {
    await page.goto('/');
    await addTodo(page, 'An active todo');

    await ui.filterButton(page, 'Completed').click();
    await expect(ui.emptyState(page)).toHaveText('No completed todos yet.');

    // Complete the only todo, then the Active bucket is empty.
    await ui.filterButton(page, 'All').click();
    await ui.item(page, 'An active todo').getByRole('checkbox').click();
    await ui.filterButton(page, 'Active').click();
    await expect(ui.emptyState(page)).toContainText('Nothing active');
  });
});

test.describe('Error handling', () => {
  test('shows an error with a working Retry when the API fails', async ({ page }) => {
    // Fail the initial list load.
    await page.route('**/api/todos', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'InternalServerError', message: 'boom' }),
        });
      }
      return route.continue();
    });

    await page.goto('/');

    const alert = ui.errorAlert(page);
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('button', { name: 'Retry' })).toBeVisible();

    // Recover: stop intercepting, then Retry should load the (empty) list.
    await page.unroute('**/api/todos');
    await alert.getByRole('button', { name: 'Retry' }).click();

    await expect(ui.errorAlert(page)).toHaveCount(0);
    await expect(ui.emptyState(page)).toBeVisible();
  });
});
