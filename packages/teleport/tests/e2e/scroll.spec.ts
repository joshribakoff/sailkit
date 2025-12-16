import { test, expect } from '@playwright/test';

/**
 * Scroll binding tests for Teleport
 *
 * Tests Ctrl+d/Ctrl+u scroll behavior for main content area.
 * j/k navigate sidebar items (which scroll via scrollIntoView - tested elsewhere).
 */

const TEST_HTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    body { display: flex; }
    .sidebar {
      width: 200px;
      height: 100%;
      overflow-y: auto;
      background: #f0f0f0;
      flex-shrink: 0;
    }
    .nav-item {
      display: block;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .main-content {
      flex: 1;
      height: 100%;
      overflow-y: auto;
    }
    .content-block {
      height: 300px;
      padding: 20px;
      border-bottom: 1px solid #ccc;
    }
    .teleport-highlight {
      outline: 2px solid blue;
      background: rgba(0,0,255,0.1);
    }
  </style>
</head>
<body>
  <nav class="sidebar">
    <a href="#1" class="nav-item">Item 1</a>
    <a href="#2" class="nav-item">Item 2</a>
    <a href="#3" class="nav-item">Item 3</a>
  </nav>
  <div class="main-content">
    <div class="content-block">Block 1</div>
    <div class="content-block">Block 2</div>
    <div class="content-block">Block 3</div>
    <div class="content-block">Block 4</div>
    <div class="content-block">Block 5</div>
    <div class="content-block">Block 6</div>
    <div class="content-block">Block 7</div>
    <div class="content-block">Block 8</div>
  </div>
  <script type="module">
    import { initTeleport } from '/dist/index.js';
    window.teleport = initTeleport({
      itemSelector: '.nav-item',
      contentContainer: '.main-content',
      sidebarContainer: '.sidebar',
      highlightClass: 'teleport-highlight',
    });
  </script>
</body>
</html>
`;

test.describe('Scroll bindings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test fixture server and set content
    await page.goto('/packages/teleport/tests/e2e/scroll-fixture.html');
  });

  test('Ctrl+d scrolls main content down', async ({ page }) => {
    const mainContent = page.locator('.main-content');

    // Get initial scroll position
    const initialScrollTop = await mainContent.evaluate((el) => el.scrollTop);
    expect(initialScrollTop).toBe(0);

    // Press Ctrl+d
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    // Wait for smooth scroll to complete
    await page.waitForTimeout(500);

    // Verify scroll position increased
    const newScrollTop = await mainContent.evaluate((el) => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(0);
  });

  test('Ctrl+u scrolls main content up', async ({ page }) => {
    const mainContent = page.locator('.main-content');

    // First scroll down to have room to scroll up
    await mainContent.evaluate((el) => {
      el.scrollTop = 500;
    });

    const initialScrollTop = await mainContent.evaluate((el) => el.scrollTop);
    expect(initialScrollTop).toBe(500);

    // Press Ctrl+u
    await page.keyboard.down('Control');
    await page.keyboard.press('u');
    await page.keyboard.up('Control');

    // Wait for smooth scroll to complete
    await page.waitForTimeout(500);

    // Verify scroll position decreased
    const newScrollTop = await mainContent.evaluate((el) => el.scrollTop);
    expect(newScrollTop).toBeLessThan(500);
  });

  test('Scrolls specified container, not window', async ({ page }) => {
    const mainContent = page.locator('.main-content');

    // Get initial positions
    const initialMainScroll = await mainContent.evaluate((el) => el.scrollTop);
    const initialWindowScroll = await page.evaluate(() => window.scrollY);

    expect(initialMainScroll).toBe(0);
    expect(initialWindowScroll).toBe(0);

    // Press Ctrl+d
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    // Wait for smooth scroll
    await page.waitForTimeout(500);

    // Main content should have scrolled
    const newMainScroll = await mainContent.evaluate((el) => el.scrollTop);
    expect(newMainScroll).toBeGreaterThan(0);

    // Window should NOT have scrolled (body has overflow: hidden)
    const newWindowScroll = await page.evaluate(() => window.scrollY);
    expect(newWindowScroll).toBe(0);
  });

  test('No scroll when at boundary - bottom', async ({ page }) => {
    const mainContent = page.locator('.main-content');

    // Scroll to absolute bottom
    await mainContent.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });

    const scrollAtBottom = await mainContent.evaluate((el) => el.scrollTop);

    // Press Ctrl+d (should do nothing, no error)
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    await page.waitForTimeout(500);

    // Should still be at bottom (or very close due to rounding)
    const scrollAfter = await mainContent.evaluate((el) => el.scrollTop);
    expect(Math.abs(scrollAfter - scrollAtBottom)).toBeLessThan(5);
  });

  test('No scroll when at boundary - top', async ({ page }) => {
    const mainContent = page.locator('.main-content');

    // Ensure at top
    const scrollAtTop = await mainContent.evaluate((el) => el.scrollTop);
    expect(scrollAtTop).toBe(0);

    // Press Ctrl+u (should do nothing, no error)
    await page.keyboard.down('Control');
    await page.keyboard.press('u');
    await page.keyboard.up('Control');

    await page.waitForTimeout(500);

    // Should still be at top
    const scrollAfter = await mainContent.evaluate((el) => el.scrollTop);
    expect(scrollAfter).toBe(0);
  });
});

test.describe('Scroll fallback behavior', () => {
  test('Fallback to window when no contentContainer specified', async ({ page }) => {
    // Use a different fixture that doesn't specify contentContainer
    await page.goto('/packages/teleport/tests/e2e/scroll-fallback-fixture.html');

    // Get initial window scroll
    const initialWindowScroll = await page.evaluate(() => window.scrollY);
    expect(initialWindowScroll).toBe(0);

    // Press Ctrl+d
    await page.keyboard.down('Control');
    await page.keyboard.press('d');
    await page.keyboard.up('Control');

    // Wait for smooth scroll
    await page.waitForTimeout(500);

    // Window should have scrolled
    const newWindowScroll = await page.evaluate(() => window.scrollY);
    expect(newWindowScroll).toBeGreaterThan(0);
  });
});

// Future tests for auto-detection feature
test.describe('Future: Auto-detection scroll context', () => {
  test.skip('hover over nested scrollable - scrolls that container', async () => {
    // Future: When scrollContext='auto', hovering over a scrollable code block
    // and pressing Ctrl+d should scroll that block, not the main content
  });

  test.skip('focus takes precedence over hover', async () => {
    // Future: Tab-focusing into a scrollable region should make it the scroll target
    // even if mouse is hovering elsewhere
  });

  test.skip('scroll context exhaustion bubbles up', async () => {
    // Future: When inner scrollable hits bottom, next Ctrl+d scrolls parent
  });
});
