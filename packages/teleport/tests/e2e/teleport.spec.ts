import { test, expect } from '@playwright/test';

test('page loads successfully', async ({ page }) => {
  await page.goto('/packages/teleport/tests/fixtures/index.html');

  // Verify the page structure is present
  await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.nav-item')).toHaveCount(5);
});
