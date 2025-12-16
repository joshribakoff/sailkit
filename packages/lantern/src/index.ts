/**
 * Lantern - Theme toggle with flash-free hydration
 *
 * @example
 * ```typescript
 * import { initTheme, toggleTheme, onThemeChange } from '@sailkit/lantern';
 *
 * // Initialize on page load (call early to prevent flash)
 * initTheme();
 *
 * // Toggle on button click
 * button.addEventListener('click', () => toggleTheme());
 *
 * // React to changes
 * onThemeChange((theme) => console.log('Theme changed to:', theme));
 * ```
 */

export type { Theme } from './core.js';
export {
  initTheme,
  getTheme,
  setTheme,
  toggleTheme,
  onThemeChange,
  initScript,
} from './core.js';
