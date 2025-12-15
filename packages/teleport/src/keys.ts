/**
 * Layer 1: Pure key binding functions
 *
 * Handles parsing key patterns and matching against KeyboardEvents.
 * No DOM dependencies - pure functions only.
 */

import type {
  KeyBindings,
  ParsedKey,
  KeyboardHandlerConfig,
  KeyboardHandler,
} from './types.js';

/**
 * Default key bindings
 */
export const DEFAULT_BINDINGS: Required<KeyBindings> = {
  nextItem: ['j', 'ArrowDown'],
  prevItem: ['k', 'ArrowUp'],
  scrollDown: ['Ctrl+d'],
  scrollUp: ['Ctrl+u'],
  nextPage: ['l', 'ArrowRight'],
  prevPage: ['h', 'ArrowLeft'],
  select: ['Enter'],
  openFinder: ['t'],
  escape: ['Escape'],
};

/**
 * Parse a key pattern string into components.
 *
 * Supports modifiers: Ctrl, Alt, Shift, Meta (Cmd on Mac)
 * Examples: 'j', 'Ctrl+d', 'Shift+Tab', 'Meta+k'
 */
export function parseKey(pattern: string): ParsedKey {
  const parts = pattern.split('+');
  const key = parts.pop()!.toLowerCase();

  return {
    key,
    ctrl: parts.some((p) => p.toLowerCase() === 'ctrl'),
    alt: parts.some((p) => p.toLowerCase() === 'alt'),
    shift: parts.some((p) => p.toLowerCase() === 'shift'),
    meta: parts.some((p) => p.toLowerCase() === 'meta' || p.toLowerCase() === 'cmd'),
  };
}

/**
 * Check if a KeyboardEvent matches a parsed key pattern.
 */
export function matchesKey(event: KeyboardEvent, parsed: ParsedKey): boolean {
  const eventKey = event.key.toLowerCase();

  // Handle special key names
  const normalizedEventKey =
    eventKey === ' ' ? 'space' : eventKey === 'arrowdown' ? 'arrowdown' : eventKey;
  const normalizedParsedKey = parsed.key.toLowerCase();

  if (normalizedEventKey !== normalizedParsedKey) {
    return false;
  }

  if (event.ctrlKey !== parsed.ctrl) return false;
  if (event.altKey !== parsed.alt) return false;
  if (event.shiftKey !== parsed.shift) return false;
  if (event.metaKey !== parsed.meta) return false;

  return true;
}

/**
 * Check if a KeyboardEvent matches any of the given key patterns.
 */
export function matchesAnyKey(event: KeyboardEvent, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesKey(event, parseKey(pattern)));
}

/**
 * Check if the event target is a typing context (input, textarea, contenteditable).
 */
export function isTypingContext(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  // Check contentEditable attribute directly for better test compatibility
  if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') {
    return true;
  }

  return false;
}

/**
 * Create a keyboard handler that maps key events to callbacks.
 */
export function createKeyboardHandler(
  config: KeyboardHandlerConfig
): KeyboardHandler {
  const {
    bindings = {},
    onNextItem,
    onPrevItem,
    onScrollDown,
    onScrollUp,
    onNextPage,
    onPrevPage,
    onSelect,
    onOpenFinder,
    onEscape,
    ignoreWhenTyping = true,
  } = config;

  const mergedBindings: Required<KeyBindings> = {
    ...DEFAULT_BINDINGS,
    ...bindings,
  };

  function handleKeydown(event: KeyboardEvent): boolean {
    // Skip if typing in input/textarea
    if (ignoreWhenTyping && isTypingContext(event)) {
      return false;
    }

    // Check each binding
    if (onNextItem && matchesAnyKey(event, mergedBindings.nextItem)) {
      event.preventDefault();
      onNextItem();
      return true;
    }

    if (onPrevItem && matchesAnyKey(event, mergedBindings.prevItem)) {
      event.preventDefault();
      onPrevItem();
      return true;
    }

    if (onScrollDown && matchesAnyKey(event, mergedBindings.scrollDown)) {
      event.preventDefault();
      onScrollDown();
      return true;
    }

    if (onScrollUp && matchesAnyKey(event, mergedBindings.scrollUp)) {
      event.preventDefault();
      onScrollUp();
      return true;
    }

    if (onNextPage && matchesAnyKey(event, mergedBindings.nextPage)) {
      event.preventDefault();
      onNextPage();
      return true;
    }

    if (onPrevPage && matchesAnyKey(event, mergedBindings.prevPage)) {
      event.preventDefault();
      onPrevPage();
      return true;
    }

    if (onSelect && matchesAnyKey(event, mergedBindings.select)) {
      event.preventDefault();
      onSelect();
      return true;
    }

    if (onOpenFinder && matchesAnyKey(event, mergedBindings.openFinder)) {
      event.preventDefault();
      onOpenFinder();
      return true;
    }

    if (onEscape && matchesAnyKey(event, mergedBindings.escape)) {
      event.preventDefault();
      onEscape();
      return true;
    }

    return false;
  }

  return {
    handleKeydown,
    destroy: () => {
      // No cleanup needed for pure handler
    },
  };
}
