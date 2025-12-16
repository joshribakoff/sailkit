/**
 * Type definitions for Compass navigation state machine.
 * These are the public types consumers use when working with the navigator.
 */

/**
 * A navigation item: either a string (leaf) or a branch with children
 */
export type NavItem = string | NavBranch;

/**
 * A branch node with slug and children
 */
export interface NavBranch {
  slug: string;
  children: NavItem[];
}

/**
 * Internal node with parent reference for tree navigation.
 * Used internally by buildFlatList - not exposed to consumers.
 */
export interface InternalNode {
  item: NavItem;
  slug: string;
  parent: InternalNode | null;
  depth: number;
  indexInParent: number;
}

/**
 * Navigator interface for traversing items.
 * This is what createNavigator() returns.
 */
export interface Navigator {
  /** The original items */
  readonly root: NavItem[];

  /** Current slug (null if empty) */
  readonly current: string | null;

  /** Current item (string or branch) */
  readonly currentItem: NavItem | null;

  /** Flat index in DFS order (-1 if no current) */
  readonly currentIndex: number;

  /** Total count of visitable items */
  readonly count: number;

  /** Move to next item in DFS order */
  next(): void;

  /** Move to previous item in DFS order */
  prev(): void;

  /** Skip to next sibling (or parent's next sibling if at end) */
  nextSibling(): void;

  /** Skip to previous sibling */
  prevSibling(): void;

  /** Go to parent node */
  parent(): void;

  /** Go to first child (if current is a branch) */
  firstChild(): void;

  /** Jump to specific index */
  goTo(index: number): void;

  /** Jump to specific slug */
  goToSlug(slug: string): void;

  /** Reset to first item */
  reset(): void;
}

/**
 * Configuration for createNavigator
 */
export interface NavigatorConfig {
  /** Forest of items to navigate (supports multiple root nodes) */
  items: NavItem[];

  /** Wrap around at ends (default: true) */
  wrap?: boolean;

  /** Only stop on leaf nodes - skip branches (default: false) */
  leavesOnly?: boolean;

  /** Initial index (-1 for no selection, default: 0) */
  initialIndex?: number;

  /** Callback on navigation */
  onChange?: (
    prevSlug: string | null,
    nextSlug: string | null,
    index: number
  ) => void;
}
