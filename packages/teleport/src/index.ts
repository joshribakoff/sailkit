/**
 * Teleport - Vim-style keyboard bindings
 *
 * A thin layer that maps keypresses to directional callbacks.
 * No navigation state - use @bearing-dev/compass for that.
 *
 * @example
 * ```typescript
 * // Standalone - just key bindings
 * import { initTeleport } from '@bearing-dev/teleport';
 *
 * const teleport = initTeleport({
 *   onDown: () => console.log('down'),
 *   onUp: () => console.log('up'),
 * });
 *
 * // With compass for navigation state
 * import { initTeleport } from '@bearing-dev/teleport';
 * import { createNavigator } from '@bearing-dev/compass';
 *
 * const nav = createNavigator({ items: ['a', 'b', 'c'], wrap: false });
 * const teleport = initTeleport({
 *   onDown: () => nav.next(),
 *   onUp: () => nav.prev(),
 * });
 * ```
 */

// Types
export type {
  KeyBindings,
  ParsedKey,
  KeyboardHandlerConfig,
  KeyboardHandler,
  TeleportConfig,
  Teleport,
} from './types.js';

// Key binding utilities
export {
  DEFAULT_BINDINGS,
  parseKey,
  matchesKey,
  matchesAnyKey,
  isTypingContext,
  createKeyboardHandler,
} from './keys.js';

// DOM utilities
export { scrollElement, getViewportHeight } from './dom.js';

// Main entry point
export { initTeleport } from './teleport.js';

// DOM Navigator (batteries-included)
export {
  createTeleport,
  type CreateTeleportConfig,
  type TeleportInstance,
  type WhenHiddenBehavior,
  type BreakpointMode,
} from './navigator.js';
