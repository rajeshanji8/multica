import { test, expect, ui, seedTodo } from './fixtures';

test.describe('All / Active / Completed filters', () => {
  test.beforeEach(async ({ request, page }) => {
    // Seed a deterministic mix: two active, one completed.
    await seedTodo(request, 'Active one');
    await seedTodo(request, 'Active two');
    await seedTodo(request, 'Completed one', true);

    await page.goto('/');
    await expect(ui.allItems(page)).toHaveCount(3);
  });

  test('All shows every todo', async ({ page }) => {
    await ui.filterButton(page, 'All').click();
    await expect(ui.allItems(page)).toHaveCount(3);
    await expect(ui.filterButton(page, 'All')).toHaveAttribute('aria-pressed', 'true');
  });

  test('Active shows only incomplete todos', async ({ page }) => {
    await ui.filterButton(page, 'Active').click();

    await expect(ui.allItems(page)).toHaveCount(2);
    await expect(ui.item(page, 'Active one')).toBeVisible();
    await expect(ui.item(page, 'Active two')).toBeVisible();
    await expect(ui.item(page, 'Completed one')).toHaveCount(0);
    await expect(ui.filterButton(page, 'Active')).toHaveAttribute('aria-pressed', 'true');
  });

  test('Completed shows only completed todos', async ({ page }) => {
    await ui.filterButton(page, 'Completed').click();

    await expect(ui.allItems(page)).toHaveCount(1);
    await expect(ui.item(page, 'Completed one')).toBeVisible();
    await expect(ui.item(page, 'Active one')).toHaveCount(0);
    await expect(ui.filterButton(page, 'Completed')).toHaveAttribute('aria-pressed', 'true');
  });

  test('filter counts stay in sync as todos change', async ({ page }) => {
    // Counts are rendered inside each filter button.
    await expect(ui.filterButton(page, 'All')).toContainText('3');
    await expect(ui.filterButton(page, 'Active')).toContainText('2');
    await expect(ui.filterButton(page, 'Completed')).toContainText('1');

    // Completing an active todo moves it between the buckets live.
    await ui.item(page, 'Active one').getByRole('checkbox').click();

    await expect(ui.filterButton(page, 'Active')).toContainText('1');
    await expect(ui.filterButton(page, 'Completed')).toContainText('2');
  });
});
