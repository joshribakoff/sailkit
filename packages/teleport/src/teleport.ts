/**
 * Teleport - Vim-style keyboard bindings
 *
 * A thin layer that maps keypresses to directional callbacks.
 * No navigation state - just key bindings.
 */

import type { TeleportConfig, Teleport } from './types.js';
import { createKeyboardHandler } from './keys.js';

/**
 * Initialize Teleport keyboard bindings.
 *
 * @example
 * ```typescript
 * // Standalone - just key bindings
 * const teleport = initTeleport({
 *   onDown: () => console.log('down pressed'),
 *   onUp: () => console.log('up pressed'),
 * });
 *
 * // With compass for navigation state
 * const nav = createNavigator({ items: ['a', 'b', 'c'], wrap: false });
 * const teleport = initTeleport({
 *   onDown: () => nav.next(),
 *   onUp: () => nav.prev(),
 * });
 *
 * // Cleanup when done
 * teleport.destroy();
 * ```
 */
export function initTeleport(config: TeleportConfig): Teleport {
  const {
    bindings,
    onDown,
    onUp,
    onLeft,
    onRight,
    onScrollDown,
    onScrollUp,
    onSelect,
    onToggleSidebar,
    onOpenFinder,
    ignoreWhenTyping = true,
  } = config;

  // Create keyboard handler
  const keyHandler = createKeyboardHandler({
    bindings,
    onDown,
    onUp,
    onLeft,
    onRight,
    onScrollDown,
    onScrollUp,
    onSelect,
    onToggleSidebar,
    onOpenFinder,
    ignoreWhenTyping,
  });

  // Attach global keydown listener
  const handleKeydown = (event: KeyboardEvent) => {
    keyHandler.handleKeydown(event);
  };

  document.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      document.removeEventListener('keydown', handleKeydown);
      keyHandler.destroy();
    },
  };
}

