/**
 * Type definitions for Teleport keyboard navigation.
 */

/**
 * Key binding configuration - maps actions to key patterns.
 * Each action can have multiple keys that trigger it.
 */
export interface KeyBindings {
  /** Navigate to next item in sidebar (default: ['j', 'ArrowDown']) */
  nextItem?: string[];
  /** Navigate to previous item in sidebar (default: ['k', 'ArrowUp']) */
  prevItem?: string[];
  /** Scroll content down (default: ['Ctrl+d']) */
  scrollDown?: string[];
  /** Scroll content up (default: ['Ctrl+u']) */
  scrollUp?: string[];
  /** Go to next page (default: ['l', 'ArrowRight']) */
  nextPage?: string[];
  /** Go to previous page (default: ['h', 'ArrowLeft']) */
  prevPage?: string[];
  /** Select/navigate to current item (default: ['Enter']) */
  select?: string[];
  /** Open fuzzy finder (default: ['t']) */
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
  onNextItem?: () => void;
  onPrevItem?: () => void;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onSelect?: () => void;
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
 * DOM navigator configuration
 */
export interface DOMNavigatorConfig {
  /** Function to get navigable items */
  getItems: () => HTMLElement[];
  /** Class to add to highlighted item (default: 'teleport-highlight') */
  highlightClass?: string;
  /** Scroll behavior options */
  scrollBehavior?: ScrollIntoViewOptions;
  /** Callback when an item is selected */
  onSelect?: (item: HTMLElement, index: number) => void;
  /** Callback when highlight changes */
  onHighlightChange?: (item: HTMLElement | null, index: number) => void;
}

/**
 * DOM navigator return type
 */
export interface DOMNavigator {
  /** Currently highlighted index (-1 if none) */
  readonly currentIndex: number;
  /** Currently highlighted element */
  readonly currentItem: HTMLElement | null;
  /** Total item count */
  readonly count: number;
  /** Move to next item */
  next(): void;
  /** Move to previous item */
  prev(): void;
  /** Go to specific index */
  goTo(index: number): void;
  /** Clear highlight */
  clear(): void;
  /** Refresh items list */
  refresh(): void;
}

/**
 * Full teleport configuration
 */
export interface TeleportConfig {
  /** Selector for navigable items in sidebar */
  itemSelector: string;
  /** Container for scrolling content (default: document.documentElement) */
  contentContainer?: HTMLElement | string;
  /** Sidebar container for scrolling nav (default: first .sidebar) */
  sidebarContainer?: HTMLElement | string;
  /** Class to add to highlighted item */
  highlightClass?: string;
  /** Custom key bindings */
  bindings?: KeyBindings;
  /** Callback when item is selected */
  onSelect?: (item: HTMLElement) => void;
  /** Callback for next page navigation */
  onNextPage?: () => void;
  /** Callback for previous page navigation */
  onPrevPage?: () => void;
  /** Callback to open fuzzy finder */
  onOpenFinder?: () => void;
  /** Scroll amount for Ctrl+d/u (default: half viewport) */
  scrollAmount?: number;
}

/**
 * Teleport instance
 */
export interface Teleport {
  /** DOM navigator for sidebar items */
  readonly navigator: DOMNavigator;
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
