import { test, expect } from '@playwright/test';

/**
 * Sidebar Visibility Tests for Teleport
 *
 * Tests the whenHidden behavior:
 * - 'ignore': j/k/Enter do nothing when sidebar is hidden
 * - 'show-sidebar': j/k/Enter trigger toggle-sidebar event, then navigate
 */

test.describe('Sidebar visibility detection', () => {
  test('detects sidebar hidden via display:none', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    // Verify sidebar is initially visible and j works
    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').first()).toHaveClass(/teleport-highlight/);

    // Hide sidebar via display:none
    await page.evaluate(() => window.hideSidebar('display'));

    // Clear highlight first
    await page.keyboard.press('Escape');

    // Press j - should be ignored
    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex); // No change
  });

  test('detects sidebar hidden via visibility:hidden', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    await page.evaluate(() => window.hideSidebar('visibility'));
    await page.keyboard.press('Escape'); // Clear any highlight

    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex);
  });

  test('detects sidebar hidden via opacity:0', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    await page.evaluate(() => window.hideSidebar('opacity'));
    await page.keyboard.press('Escape');

    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex);
  });

  test('detects sidebar hidden via translateX(-100%)', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition
    await page.keyboard.press('Escape');

    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex);
  });

  test('detects sidebar hidden via .hidden class', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    await page.evaluate(() => window.hideSidebar('hidden-class'));
    await page.keyboard.press('Escape');

    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex);
  });

  test('detects sidebar hidden via .collapsed class', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    await page.evaluate(() => window.hideSidebar('collapsed-class'));
    await page.keyboard.press('Escape');

    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex);
  });

  test('detects sidebar hidden via [hidden] attribute', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    await page.evaluate(() => window.hideSidebar('hidden-attr'));
    await page.keyboard.press('Escape');

    const initialIndex = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    const afterIndex = await page.evaluate(() => window.getHighlightedIndex());

    expect(afterIndex).toBe(initialIndex);
  });
});

test.describe('whenHidden: ignore', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');
  });

  test('j/k work when sidebar is visible', async ({ page }) => {
    // j should highlight first item
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(0);

    // j again should move to second item
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(1);

    // k should move back
    await page.keyboard.press('k');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(0);
  });

  test('j does nothing when sidebar is hidden', async ({ page }) => {
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition
    await page.keyboard.press('Escape');

    const before = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    const after = await page.evaluate(() => window.getHighlightedIndex());

    expect(after).toBe(before);
  });

  test('k does nothing when sidebar is hidden', async ({ page }) => {
    // First navigate to an item while visible
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(1);

    // Hide sidebar
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    // k should do nothing
    const before = await page.evaluate(() => window.getHighlightedIndex());
    await page.keyboard.press('k');
    const after = await page.evaluate(() => window.getHighlightedIndex());

    expect(after).toBe(before);
  });

  test('Enter does nothing when sidebar is hidden', async ({ page }) => {
    // Navigate to first item
    await page.keyboard.press('j');

    // Hide sidebar
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    // Get current URL
    const beforeUrl = page.url();

    // Enter should do nothing (not navigate)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    const afterUrl = page.url();
    expect(afterUrl).toBe(beforeUrl);
  });

  test('does NOT emit toggle-sidebar event', async ({ page }) => {
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    const beforeCount = await page.evaluate(() => window.toggleCount);
    await page.keyboard.press('j');
    const afterCount = await page.evaluate(() => window.toggleCount);

    expect(afterCount).toBe(beforeCount);
  });

  test('navigation resumes when sidebar becomes visible again', async ({ page }) => {
    // Hide sidebar
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    // j should do nothing
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(-1);

    // Show sidebar
    await page.evaluate(() => window.showSidebar());
    await page.waitForTimeout(350); // Wait for CSS transition

    // Now j should work
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(0);
  });
});

test.describe('whenHidden: show-sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=show-sidebar');
  });

  test('j/k work normally when sidebar is visible', async ({ page }) => {
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(0);

    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(1);
  });

  test('j emits toggle-sidebar event when sidebar is hidden', async ({ page }) => {
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    const beforeCount = await page.evaluate(() => window.toggleCount);
    await page.keyboard.press('j');
    const afterCount = await page.evaluate(() => window.toggleCount);

    expect(afterCount).toBe(beforeCount + 1);
  });

  test('k emits toggle-sidebar event when sidebar is hidden', async ({ page }) => {
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    const beforeCount = await page.evaluate(() => window.toggleCount);
    await page.keyboard.press('k');
    const afterCount = await page.evaluate(() => window.toggleCount);

    expect(afterCount).toBe(beforeCount + 1);
  });

  test('Enter emits toggle-sidebar event when sidebar is hidden', async ({ page }) => {
    // First highlight an item while visible
    await page.keyboard.press('j');

    // Hide sidebar
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    const beforeCount = await page.evaluate(() => window.toggleCount);
    await page.keyboard.press('Enter');
    const afterCount = await page.evaluate(() => window.toggleCount);

    expect(afterCount).toBe(beforeCount + 1);
  });

  test('navigates after toggle event (simulated sidebar open)', async ({ page }) => {
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    // Set up listener to show sidebar when toggle event fires
    await page.evaluate(() => {
      document.addEventListener('teleport:toggle-sidebar', () => {
        window.showSidebar();
      }, { once: true });
    });

    // Press j - should trigger toggle, sidebar opens, then navigate
    await page.keyboard.press('j');
    await page.waitForTimeout(100); // Wait for the delayed navigation

    // After toggle + delay, should have navigated
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(0);
  });
});

test.describe('Other bindings when sidebar hidden', () => {
  test('Ctrl+d still scrolls when sidebar hidden (ignore mode)', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    // Make body scrollable by removing height constraint and adding content
    await page.evaluate(() => {
      document.body.style.height = 'auto';
      document.body.style.minHeight = '300vh';
    });

    const initialScroll = await page.evaluate(() => window.scrollY);
    expect(initialScroll).toBe(0);

    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    await page.waitForTimeout(500);

    const afterScroll = await page.evaluate(() => window.scrollY);
    expect(afterScroll).toBeGreaterThan(initialScroll);
  });

  test('t (toggle sidebar) still works when sidebar hidden', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    const beforeCount = await page.evaluate(() => window.toggleCount);
    await page.keyboard.press('t');
    const afterCount = await page.evaluate(() => window.toggleCount);

    expect(afterCount).toBe(beforeCount + 1);
  });

  test('Escape clears highlight regardless of sidebar visibility', async ({ page }) => {
    await page.goto('/packages/teleport/tests/e2e/sidebar-visibility-fixture.html?whenHidden=ignore');

    // Highlight an item
    await page.keyboard.press('j');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(0);

    // Hide sidebar
    await page.evaluate(() => window.hideSidebar('transform'));
    await page.waitForTimeout(350); // Wait for CSS transition

    // Escape should still clear
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => window.getHighlightedIndex())).toBe(-1);
  });
});

test.describe('No sidebarSelector (backwards compatibility)', () => {
  test('j/k always work when no sidebarSelector provided', async ({ page }) => {
    // Use the basic fixture which doesn't have sidebarSelector
    await page.goto('/packages/teleport/tests/fixtures/index.html');

    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').first()).toHaveClass(/teleport-highlight/);

    await page.keyboard.press('j');
    await expect(page.locator('.nav-item').nth(1)).toHaveClass(/teleport-highlight/);
  });
});
