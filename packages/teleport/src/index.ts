/**
 * Teleport - Vim-style keyboard navigation bindings
 *
 * Three layers of abstraction:
 * - Layer 1: Pure key binding functions (keys.ts)
 * - Layer 2: DOM adapter for highlighting/scrolling (dom.ts)
 * - Layer 3: Full integration (teleport.ts)
 *
 * @example
 * ```typescript
 * // Layer 3: Full integration (most common)
 * import { initTeleport } from '@sailkit/teleport';
 *
 * const teleport = initTeleport({
 *   itemSelector: '.nav-item',
 *   onNextPage: () => navigate('next'),
 *   onPrevPage: () => navigate('prev'),
 * });
 *
 * // Layer 1 + 2: Custom integration
 * import { createKeyboardHandler, createDOMNavigator } from '@sailkit/teleport';
 *
 * const navigator = createDOMNavigator({
 *   getItems: () => document.querySelectorAll('.item'),
 * });
 *
 * const keyHandler = createKeyboardHandler({
 *   onNextItem: () => navigator.next(),
 *   onPrevItem: () => navigator.prev(),
 * });
 * ```
 */

// Types
export type {
  KeyBindings,
  ParsedKey,
  KeyboardHandlerConfig,
  KeyboardHandler,
  DOMNavigatorConfig,
  DOMNavigator,
  TeleportConfig,
  Teleport,
  FinderItem,
  FuzzyFinderConfig,
} from './types.js';

// Layer 1: Key bindings
export {
  DEFAULT_BINDINGS,
  parseKey,
  matchesKey,
  matchesAnyKey,
  isTypingContext,
  createKeyboardHandler,
} from './keys.js';

// Layer 2: DOM adapter
export {
  createDOMNavigator,
  scrollElement,
  getViewportHeight,
  syncWithCurrentPath,
} from './dom.js';

// Layer 3: Full integration
export { initTeleport, injectTeleportStyles } from './teleport.js';
