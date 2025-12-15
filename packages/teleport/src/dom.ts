/**
 * Layer 2: DOM adapter
 *
 * Handles DOM operations like highlighting elements and scrolling.
 * Works with any list of elements - can be used standalone or with compass.
 */

import type { DOMNavigatorConfig, DOMNavigator } from './types.js';

/**
 * Default scroll behavior
 */
const DEFAULT_SCROLL_BEHAVIOR: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'nearest',
  inline: 'nearest',
};

/**
 * Create a DOM navigator for a list of elements.
 *
 * Manages highlighting and scrolling for keyboard navigation.
 * The getItems function is called each time to support dynamic lists.
 */
export function createDOMNavigator(config: DOMNavigatorConfig): DOMNavigator {
  const {
    getItems,
    highlightClass = 'teleport-highlight',
    scrollBehavior = DEFAULT_SCROLL_BEHAVIOR,
    onSelect,
    onHighlightChange,
  } = config;

  let currentIndex = -1;
  let items: HTMLElement[] = [];

  function refresh(): void {
    items = getItems();
    // Clamp current index to valid range
    if (items.length === 0) {
      currentIndex = -1;
    } else if (currentIndex >= items.length) {
      currentIndex = items.length - 1;
    }
  }

  function clearHighlight(): void {
    // Remove highlight from all items (not just current, in case list changed)
    items.forEach((item) => item.classList.remove(highlightClass));
  }

  function applyHighlight(): void {
    clearHighlight();
    if (currentIndex >= 0 && currentIndex < items.length) {
      const item = items[currentIndex];
      item.classList.add(highlightClass);
      // scrollIntoView may not exist in test environments
      if (typeof item.scrollIntoView === 'function') {
        item.scrollIntoView(scrollBehavior);
      }
      onHighlightChange?.(item, currentIndex);
    } else {
      onHighlightChange?.(null, -1);
    }
  }

  function goTo(index: number): void {
    refresh();
    if (index >= 0 && index < items.length) {
      currentIndex = index;
      applyHighlight();
    }
  }

  function next(): void {
    refresh();
    if (items.length === 0) return;

    if (currentIndex < 0) {
      // Start at first item
      currentIndex = 0;
    } else if (currentIndex < items.length - 1) {
      currentIndex++;
    } else {
      // Wrap to start
      currentIndex = 0;
    }
    applyHighlight();
  }

  function prev(): void {
    refresh();
    if (items.length === 0) return;

    if (currentIndex < 0) {
      // Start at last item
      currentIndex = items.length - 1;
    } else if (currentIndex > 0) {
      currentIndex--;
    } else {
      // Wrap to end
      currentIndex = items.length - 1;
    }
    applyHighlight();
  }

  function clear(): void {
    clearHighlight();
    currentIndex = -1;
    onHighlightChange?.(null, -1);
  }

  function select(): void {
    if (currentIndex >= 0 && currentIndex < items.length) {
      onSelect?.(items[currentIndex], currentIndex);
    }
  }

  // Initialize items
  refresh();

  return {
    get currentIndex() {
      return currentIndex;
    },
    get currentItem() {
      return currentIndex >= 0 && currentIndex < items.length
        ? items[currentIndex]
        : null;
    },
    get count() {
      return items.length;
    },
    next,
    prev,
    goTo,
    clear,
    refresh,
  };
}

/**
 * Scroll an element by a given amount.
 */
export function scrollElement(
  element: HTMLElement | Window,
  amount: number,
  direction: 'up' | 'down'
): void {
  const delta = direction === 'down' ? amount : -amount;

  if (element instanceof Window) {
    element.scrollBy({ top: delta, behavior: 'smooth' });
  } else {
    element.scrollBy({ top: delta, behavior: 'smooth' });
  }
}

/**
 * Get the viewport height for scroll calculations.
 */
export function getViewportHeight(): number {
  return window.innerHeight;
}

/**
 * Sync DOM navigator with current URL.
 * Finds the item matching the current path and highlights it.
 */
export function syncWithCurrentPath(
  navigator: DOMNavigator,
  getItems: () => HTMLElement[],
  pathAttribute: string = 'href'
): void {
  const currentPath = window.location.pathname;
  const items = getItems();

  const index = items.findIndex((item) => {
    const href = item.getAttribute(pathAttribute);
    return href === currentPath;
  });

  if (index !== -1) {
    navigator.goTo(index);
  }
}
