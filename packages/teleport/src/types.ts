/**
 * Type definitions for Teleport keyboard navigation.
 */

/**
 * Key binding configuration - maps directions to key patterns.
 * Each direction can have multiple keys that trigger it.
 */
export interface KeyBindings {
  /** Move down (default: ['j', 'ArrowDown']) */
  down?: string[];
  /** Move up (default: ['k', 'ArrowUp']) */
  up?: string[];
  /** Move left (default: ['h', 'ArrowLeft']) */
  left?: string[];
  /** Move right (default: ['l', 'ArrowRight']) */
  right?: string[];
  /** Scroll content down (default: ['Ctrl+d']) */
  scrollDown?: string[];
  /** Scroll content up (default: ['Ctrl+u']) */
  scrollUp?: string[];
  /** Select/confirm (default: ['Enter']) */
  select?: string[];
  /** Toggle sidebar (default: ['t']) */
  toggleSidebar?: string[];
  /** Open fuzzy finder (default: ['/']) */
  openFinder?: string[];
  /** Close/escape (default: ['Escape']) */
  escape?: string[];
}

/**
 * Parsed key pattern for matching
 */
export interface ParsedKey {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}

/**
 * Keyboard handler configuration
 */
export interface KeyboardHandlerConfig {
  bindings?: KeyBindings;
  onDown?: () => void;
  onUp?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  onSelect?: () => void;
  onToggleSidebar?: () => void;
  onOpenFinder?: () => void;
  onEscape?: () => void;
  /** Ignore keystrokes when typing in input/textarea (default: true) */
  ignoreWhenTyping?: boolean;
}

/**
 * Keyboard handler return type
 */
export interface KeyboardHandler {
  /** Handle a keydown event, returns true if handled */
  handleKeydown: (event: KeyboardEvent) => boolean;
  /** Clean up event listeners */
  destroy: () => void;
}

/**
 * Full teleport configuration
 */
export interface TeleportConfig {
  /** Custom key bindings */
  bindings?: KeyBindings;
  /** Directional callbacks */
  onDown?: () => void;
  onUp?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  /** Scroll callbacks */
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  /** Action callbacks */
  onSelect?: () => void;
  onToggleSidebar?: () => void;
  onOpenFinder?: () => void;
  onEscape?: () => void;
  /** Ignore keystrokes when typing in input/textarea (default: true) */
  ignoreWhenTyping?: boolean;
}

/**
 * Teleport instance
 */
export interface Teleport {
  /** Clean up all event listeners */
  destroy(): void;
}

/**
 * Fuzzy finder item with metadata
 */
export interface FinderItem {
  slug: string;
  title: string;
  element?: HTMLElement;
}

/**
 * Fuzzy finder configuration
 */
export interface FuzzyFinderConfig {
  /** Items to search */
  items: FinderItem[];
  /** Callback when item is selected */
  onSelect: (item: FinderItem) => void;
  /** Callback when finder is closed */
  onClose: () => void;
}
