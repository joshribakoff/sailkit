/**
 * Lantern - Theme toggle with flash-free hydration
 *
 * Pure functions for theme management. Works in any runtime.
 * Convention: stores in localStorage key 'theme', sets data-theme on <html>.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'dark';

type ThemeChangeCallback = (theme: Theme) => void;
const listeners: Set<ThemeChangeCallback> = new Set();

/**
 * Initialize theme from localStorage or default.
 * Call this early (before paint) to prevent flash.
 *
 * @returns The current theme
 */
export function initTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const theme = stored || DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

/**
 * Get the current theme from the DOM.
 *
 * @returns The current theme
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  return (document.documentElement.getAttribute('data-theme') as Theme) || DEFAULT_THEME;
}

/**
 * Set the theme explicitly.
 *
 * @param theme - The theme to set
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  notifyListeners(theme);
}

/**
 * Toggle between light and dark themes.
 *
 * @returns The new theme after toggling
 */
export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/**
 * Subscribe to theme changes.
 *
 * @param callback - Function called when theme changes
 * @returns Unsubscribe function
 */
export function onThemeChange(callback: ThemeChangeCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(theme: Theme): void {
  listeners.forEach((cb) => cb(theme));
}

/**
 * Inline script string for flash prevention.
 * Include this in a <script> tag that runs before paint.
 */
export const initScript = `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t)})();`;
