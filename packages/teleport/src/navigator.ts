/**
 * DOM Navigator - Creates a complete keyboard navigation system.
 *
 * Scans the DOM for navigable items, uses Compass for state,
 * and handles all DOM updates (highlighting, scrolling).
 */

import { createNavigator, type Navigator, type NavItem } from '@bearing-dev/compass';
import { createKeyboardHandler, DEFAULT_BINDINGS } from './keys.js';
import type { KeyBindings } from './types.js';
import { scrollElement, getViewportHeight } from './dom.js';

/**
 * Behavior when sidebar is hidden and navigation keys are pressed
 */
export type WhenHiddenBehavior = 'ignore' | 'show-sidebar';

/**
 * Configuration for createTeleport
 */
export interface CreateTeleportConfig {
  /** CSS selector for navigable items (required) */
  itemSelector: string;
  /** CSS selector for sidebar container (optional, enables visibility-aware navigation) */
  sidebarSelector?: string;
  /** Class to add to highlighted item (default: 'teleport-highlight') */
  highlightClass?: string;
  /** Attribute to use for item identifier (default: 'href', falls back to index) */
  idAttribute?: string;
  /** Enable wrapping at ends (default: true) */
  wrap?: boolean;
  /** Custom key bindings */
  bindings?: KeyBindings;
  /** Ignore keystrokes when typing (default: true) */
  ignoreWhenTyping?: boolean;
  /** What to do when j/k/Enter pressed while sidebar hidden (default: 'ignore') */
  whenHidden?: WhenHiddenBehavior;
  /** Callback when item is selected (Enter pressed) */
  onSelect?: (element: HTMLElement, slug: string) => void;
  /** Callback when sidebar toggle is triggered */
  onToggleSidebar?: () => void;
  /** Callback when finder is triggered */
  onOpenFinder?: () => void;
  /** Callback when navigating left (prev page) */
  onLeft?: () => void;
  /** Callback when navigating right (next page) */
  onRight?: () => void;
}

/**
 * Teleport instance returned by createTeleport
 */
export interface TeleportInstance {
  /** Get the underlying Compass navigator */
  readonly navigator: Navigator;
  /** Get currently highlighted element */
  readonly currentElement: HTMLElement | null;
  /** Refresh items from DOM (call after DOM changes) */
  refresh(): void;
  /** Clean up all event listeners */
  destroy(): void;
}

/**
 * Create a complete keyboard navigation system for any website.
 *
 * Scans the DOM for elements matching itemSelector, builds a Compass
 * navigator, and handles all keyboard bindings and DOM updates.
 *
 * @example
 * ```typescript
 * const teleport = createTeleport({
 *   itemSelector: '.nav-item',
 *   highlightClass: 'highlight',
 *   onSelect: (el, slug) => window.location.href = slug,
 * });
 *
 * // Later, when DOM changes
 * teleport.refresh();
 *
 * // Cleanup
 * teleport.destroy();
 * ```
 */
export function createTeleport(config: CreateTeleportConfig): TeleportInstance {
  const {
    itemSelector,
    sidebarSelector,
    highlightClass = 'teleport-highlight',
    idAttribute = 'href',
    wrap = true,
    bindings = {},
    ignoreWhenTyping = true,
    whenHidden = 'ignore',
    onSelect,
    onToggleSidebar,
    onOpenFinder,
    onLeft,
    onRight,
  } = config;

  // Track elements and their slugs
  let elements: HTMLElement[] = [];
  let slugs: string[] = [];
  let navigator: Navigator | null = null;

  /**
   * Check if sidebar is visible (if sidebarSelector is configured)
   */
  function isSidebarVisible(): boolean {
    if (!sidebarSelector) return true; // No selector = always "visible"
    const sidebar = document.querySelector<HTMLElement>(sidebarSelector);
    if (!sidebar) return true; // No sidebar element = always "visible"

    // Check common visibility patterns
    const style = getComputedStyle(sidebar);
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;
    if (style.opacity === '0') return false;

    // Check for common "hidden" class patterns
    if (sidebar.classList.contains('hidden')) return false;
    if (sidebar.classList.contains('collapsed')) return false;
    if (sidebar.hasAttribute('hidden')) return false;

    // Check transform - browser converts translateX to matrix(a,b,c,d,tx,ty)
    // A negative tx means the element is translated left (off-screen)
    const transform = style.transform;
    if (transform && transform !== 'none') {
      const match = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^,]+)/);
      if (match) {
        const tx = parseFloat(match[1]);
        // If translated left by more than half the sidebar width, consider hidden
        if (tx < -(sidebar.offsetWidth / 2)) return false;
      }
    }

    return true;
  }

  /**
   * Handle navigation action with sidebar visibility awareness
   */
  function handleNavigationAction(action: () => void): void {
    if (isSidebarVisible()) {
      action();
    } else if (whenHidden === 'show-sidebar') {
      // Show sidebar first, then navigate
      document.dispatchEvent(new CustomEvent('teleport:toggle-sidebar'));
      // Small delay to let sidebar animate open
      setTimeout(action, 50);
    }
    // 'ignore' behavior: do nothing
  }

  /**
   * Scan DOM and build navigation state
   */
  function scanDOM(): void {
    elements = Array.from(document.querySelectorAll<HTMLElement>(itemSelector));
    slugs = elements.map((el, index) => {
      return el.getAttribute(idAttribute) || el.id || `item-${index}`;
    });

    // Create Compass navigator from slugs
    const items: NavItem[] = slugs;
    navigator = createNavigator({
      items,
      wrap,
      initialIndex: -1, // Start with no selection
      onChange: (_prev: string | null, _next: string | null, index: number) => {
        updateHighlight(index);
      },
    });
  }

  /**
   * Update DOM to reflect current highlight
   */
  function updateHighlight(index: number): void {
    // Clear all highlights
    elements.forEach((el) => el.classList.remove(highlightClass));

    // Add highlight to current
    if (index >= 0 && index < elements.length) {
      const el = elements[index];
      el.classList.add(highlightClass);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Sync highlight with current URL (for page navigation)
   */
  function syncWithUrl(): void {
    if (!navigator) return;
    const currentPath = window.location.pathname;
    const index = slugs.findIndex((slug) => slug === currentPath);
    if (index !== -1) {
      navigator.goTo(index);
    }
  }

  // Initial scan
  scanDOM();
  syncWithUrl();

  // Set up keyboard handler
  const mergedBindings: KeyBindings = {
    ...DEFAULT_BINDINGS,
    ...bindings,
  };

  const keyHandler = createKeyboardHandler({
    bindings: mergedBindings,
    ignoreWhenTyping,
    onDown: () => handleNavigationAction(() => navigator?.next()),
    onUp: () => handleNavigationAction(() => navigator?.prev()),
    onScrollDown: () => scrollElement(window, getViewportHeight() / 2, 'down'),
    onScrollUp: () => scrollElement(window, getViewportHeight() / 2, 'up'),
    onSelect: () => handleNavigationAction(() => {
      if (!navigator || navigator.currentIndex < 0) return;
      const el = elements[navigator.currentIndex];
      const slug = slugs[navigator.currentIndex];
      if (onSelect) {
        onSelect(el, slug);
      } else {
        // Default: navigate to href if present
        const href = el.getAttribute('href');
        if (href) window.location.href = href;
      }
    }),
    onLeft: () => {
      if (onLeft) {
        onLeft();
      } else {
        // Default: navigate to previous page based on current URL
        const currentPath = window.location.pathname;
        const pageIndex = slugs.findIndex((slug) => slug === currentPath);
        if (pageIndex > 0) {
          const prevHref = slugs[pageIndex - 1];
          if (prevHref) window.location.href = prevHref;
        }
      }
    },
    onRight: () => {
      if (onRight) {
        onRight();
      } else {
        // Default: navigate to next page based on current URL
        const currentPath = window.location.pathname;
        const pageIndex = slugs.findIndex((slug) => slug === currentPath);
        if (pageIndex !== -1 && pageIndex < slugs.length - 1) {
          const nextHref = slugs[pageIndex + 1];
          if (nextHref) window.location.href = nextHref;
        }
      }
    },
    onEscape: () => {
      elements.forEach((el) => el.classList.remove(highlightClass));
      if (navigator) {
        // Reset to no selection
        navigator.goTo(-1);
      }
    },
    onToggleSidebar: onToggleSidebar
      ? onToggleSidebar
      : () => document.dispatchEvent(new CustomEvent('teleport:toggle-sidebar')),
    onOpenFinder: onOpenFinder
      ? onOpenFinder
      : () => document.dispatchEvent(new CustomEvent('teleport:open-finder')),
  });

  // Attach global keydown listener
  const handleKeydown = (event: KeyboardEvent) => {
    keyHandler.handleKeydown(event);
  };
  document.addEventListener('keydown', handleKeydown);

  return {
    get navigator(): Navigator {
      return navigator!;
    },

    get currentElement(): HTMLElement | null {
      if (!navigator || navigator.currentIndex < 0) return null;
      return elements[navigator.currentIndex] || null;
    },

    refresh(): void {
      const currentSlug = navigator?.current;
      scanDOM();
      // Try to restore position
      if (currentSlug && navigator) {
        navigator.goToSlug(currentSlug);
      }
    },

    destroy(): void {
      document.removeEventListener('keydown', handleKeydown);
      keyHandler.destroy();
      elements.forEach((el) => el.classList.remove(highlightClass));
    },
  };
}
