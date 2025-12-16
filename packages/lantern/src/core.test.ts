import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initTheme, getTheme, setTheme, toggleTheme, onThemeChange, initScript } from './core.js';

describe('lantern', () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  describe('initTheme', () => {
    it('should set default theme when nothing stored', () => {
      const theme = initTheme();
      expect(theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should restore theme from localStorage', () => {
      localStorage.setItem('theme', 'light');
      const theme = initTheme();
      expect(theme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('getTheme', () => {
    it('should return current theme from DOM', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      expect(getTheme()).toBe('light');
    });

    it('should return default when no theme set', () => {
      expect(getTheme()).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should set theme in DOM and localStorage', () => {
      setTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should notify listeners', () => {
      const callback = vi.fn();
      onThemeChange(callback);
      setTheme('light');
      expect(callback).toHaveBeenCalledWith('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      initTheme();
      const next = toggleTheme();
      expect(next).toBe('light');
      expect(getTheme()).toBe('light');
    });

    it('should toggle from light to dark', () => {
      setTheme('light');
      const next = toggleTheme();
      expect(next).toBe('dark');
      expect(getTheme()).toBe('dark');
    });
  });

  describe('onThemeChange', () => {
    it('should subscribe and unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = onThemeChange(callback);

      setTheme('light');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      setTheme('dark');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('initScript', () => {
    it('should be a valid inline script', () => {
      expect(initScript).toContain('localStorage');
      expect(initScript).toContain('data-theme');
    });
  });
});
