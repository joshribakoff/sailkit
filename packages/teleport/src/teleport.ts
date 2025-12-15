/**
 * Layer 3: Full Teleport integration
 *
 * Wires together key bindings, DOM navigation, and callbacks
 * for a complete vim-style navigation experience.
 */

import type { TeleportConfig, Teleport } from './types.js';
import { createKeyboardHandler } from './keys.js';
import { createDOMNavigator, scrollElement, getViewportHeight } from './dom.js';

/**
 * Initialize Teleport with full keyboard navigation.
 *
 * @example
 * ```typescript
 * const teleport = initTeleport({
 *   itemSelector: '.nav-item',
 *   onSelect: (item) => window.location.href = item.getAttribute('href'),
 *   onNextPage: () => navigateToNext(),
 *   onPrevPage: () => navigateToPrev(),
 * });
 *
 * // Cleanup when done
 * teleport.destroy();
 * ```
 */
export function initTeleport(config: TeleportConfig): Teleport {
  const {
    itemSelector,
    contentContainer,
    sidebarContainer,
    highlightClass = 'teleport-highlight',
    bindings,
    onSelect,
    onNextPage,
    onPrevPage,
    onOpenFinder,
    scrollAmount,
  } = config;

  // Resolve containers
  const resolveContainer = (
    container: HTMLElement | string | undefined,
    fallbackSelector: string
  ): HTMLElement | null => {
    if (container instanceof HTMLElement) return container;
    if (typeof container === 'string') return document.querySelector(container);
    return document.querySelector(fallbackSelector);
  };

  const content =
    resolveContainer(contentContainer, 'main') || document.documentElement;
  const sidebar = resolveContainer(sidebarContainer, '.sidebar');

  // Create DOM navigator for sidebar items
  const navigator = createDOMNavigator({
    getItems: () => Array.from(document.querySelectorAll<HTMLElement>(itemSelector)),
    highlightClass,
    scrollBehavior: { behavior: 'smooth', block: 'nearest' },
    onSelect: (item, index) => {
      // Default: navigate to href if present
      const href = item.getAttribute('href');
      if (href && onSelect) {
        onSelect(item);
      } else if (href) {
        window.location.href = href;
      }
    },
  });

  // Calculate scroll amount (default: half viewport)
  const getScrollAmount = () => scrollAmount ?? getViewportHeight() / 2;

  // Create keyboard handler
  const keyHandler = createKeyboardHandler({
    bindings,
    onNextItem: () => navigator.next(),
    onPrevItem: () => navigator.prev(),
    onScrollDown: () => {
      scrollElement(content, getScrollAmount(), 'down');
    },
    onScrollUp: () => {
      scrollElement(content, getScrollAmount(), 'up');
    },
    onNextPage: () => {
      if (onNextPage) {
        onNextPage();
      } else {
        // Default: click current highlighted item if it has a "next" sibling
        const current = navigator.currentItem;
        if (current) {
          const href = current.getAttribute('href');
          if (href) window.location.href = href;
        }
      }
    },
    onPrevPage: () => {
      if (onPrevPage) {
        onPrevPage();
      }
    },
    onSelect: () => {
      const current = navigator.currentItem;
      if (current) {
        if (onSelect) {
          onSelect(current);
        } else {
          const href = current.getAttribute('href');
          if (href) window.location.href = href;
        }
      }
    },
    onOpenFinder: () => {
      if (onOpenFinder) {
        onOpenFinder();
      }
    },
    onEscape: () => {
      navigator.clear();
    },
  });

  // Attach global keydown listener
  const handleKeydown = (event: KeyboardEvent) => {
    keyHandler.handleKeydown(event);
  };

  document.addEventListener('keydown', handleKeydown);

  // Sync with current URL on init
  const currentPath = window.location.pathname;
  const items = Array.from(document.querySelectorAll<HTMLElement>(itemSelector));
  const currentIndex = items.findIndex(
    (item) => item.getAttribute('href') === currentPath
  );
  if (currentIndex !== -1) {
    navigator.goTo(currentIndex);
  }

  return {
    navigator,
    destroy() {
      document.removeEventListener('keydown', handleKeydown);
      navigator.clear();
      keyHandler.destroy();
    },
  };
}

/**
 * Inject CSS for teleport highlight styling.
 * Call this once to add default styles, or provide your own CSS.
 */
export function injectTeleportStyles(highlightClass: string = 'teleport-highlight'): void {
  const styleId = 'teleport-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .${highlightClass} {
      outline: 2px solid var(--color-accent, #3b82f6);
      outline-offset: -2px;
      background-color: var(--color-accent-dim, rgba(59, 130, 246, 0.1));
    }
  `;
  document.head.appendChild(style);
}
