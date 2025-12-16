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
    onEscape,
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
    onEscape,
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
