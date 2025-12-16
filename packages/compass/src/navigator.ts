/**
 * The main navigator factory - creates a stateful navigation controller.
 * This is the primary export consumers use.
 *
 * Usage:
 *   const nav = createNavigator({ items: ['a', 'b', 'c'] });
 *   nav.next();
 *   console.log(nav.current); // 'b'
 */

import type {
  NavBranch,
  Navigator,
  NavigatorConfig,
  InternalNode,
} from './types.js';
import { isBranch, getSlug } from './helpers.js';
import { buildFlatList } from './buildFlatList.js';

/**
 * Create a navigator for the given items.
 */
export function createNavigator(config: NavigatorConfig): Navigator {
  const { items, wrap = true, leavesOnly = false, initialIndex, onChange } = config;

  const flatList = buildFlatList(items, leavesOnly);
  // Default to 0 if items exist, but allow initialIndex to override (including -1 for no selection)
  const defaultIdx = flatList.length > 0 ? 0 : -1;
  let currentIdx = initialIndex !== undefined ? initialIndex : defaultIdx;

  function getCurrent(): InternalNode | null {
    return currentIdx >= 0 && currentIdx < flatList.length
      ? flatList[currentIdx]
      : null;
  }

  function setIndex(newIndex: number): void {
    const prevSlug = getCurrent()?.slug ?? null;
    currentIdx = newIndex;
    const nextSlug = getCurrent()?.slug ?? null;

    if (onChange && prevSlug !== nextSlug) {
      onChange(prevSlug, nextSlug, currentIdx);
    }
  }

  function findNextSiblingIndex(internal: InternalNode): number {
    let current: InternalNode | null = internal;

    while (current) {
      const parent: InternalNode | null = current.parent;
      const siblings = parent ? (parent.item as NavBranch).children : items;
      const nextSiblingIdx = current.indexInParent + 1;

      if (nextSiblingIdx < siblings.length) {
        const nextSibling = siblings[nextSiblingIdx];
        const nextSlug = getSlug(nextSibling);
        // Find in flat list
        const flatIdx = flatList.findIndex(
          (n) => n.slug === nextSlug && n.depth === current!.depth
        );
        if (flatIdx !== -1) return flatIdx;
        // If branch was skipped (leavesOnly), find first descendant
        const descendantIdx = flatList.findIndex((n) => {
          let check: InternalNode | null = n;
          while (check) {
            if (getSlug(check.item) === nextSlug) return true;
            check = check.parent;
          }
          return false;
        });
        if (descendantIdx !== -1) return descendantIdx;
      }

      current = parent;
    }

    return -1;
  }

  function findPrevSiblingIndex(internal: InternalNode): number {
    const parent = internal.parent;
    const siblings = parent ? (parent.item as NavBranch).children : items;
    const prevSiblingIdx = internal.indexInParent - 1;

    if (prevSiblingIdx >= 0) {
      const prevSibling = siblings[prevSiblingIdx];
      const prevSlug = getSlug(prevSibling);
      const flatIdx = flatList.findIndex((n) => n.slug === prevSlug);
      if (flatIdx !== -1) return flatIdx;
    }

    return -1;
  }

  function findParentIndex(internal: InternalNode): number {
    if (!internal.parent) return -1;
    return flatList.findIndex((n) => n.item === internal.parent!.item);
  }

  function findFirstChildIndex(internal: InternalNode): number {
    if (!isBranch(internal.item)) return -1;
    const children = internal.item.children;
    if (children.length === 0) return -1;

    const firstChild = children[0];
    const firstSlug = getSlug(firstChild);

    for (let i = 0; i < flatList.length; i++) {
      if (
        flatList[i].slug === firstSlug &&
        flatList[i].parent?.item === internal.item
      ) {
        return i;
      }
    }
    return -1;
  }

  const navigator: Navigator = {
    get root() {
      return items;
    },

    get current() {
      return getCurrent()?.slug ?? null;
    },

    get currentItem() {
      return getCurrent()?.item ?? null;
    },

    get currentIndex() {
      return currentIdx;
    },

    get count() {
      return flatList.length;
    },

    next() {
      if (flatList.length === 0) return;

      let newIndex = currentIdx + 1;
      if (newIndex >= flatList.length) {
        newIndex = wrap ? 0 : flatList.length - 1;
      }
      setIndex(newIndex);
    },

    prev() {
      if (flatList.length === 0) return;

      let newIndex = currentIdx - 1;
      if (newIndex < 0) {
        newIndex = wrap ? flatList.length - 1 : 0;
      }
      setIndex(newIndex);
    },

    nextSibling() {
      const current = getCurrent();
      if (!current) return;

      const nextIdx = findNextSiblingIndex(current);
      if (nextIdx !== -1) {
        setIndex(nextIdx);
      } else if (wrap && flatList.length > 0) {
        setIndex(0);
      }
    },

    prevSibling() {
      const current = getCurrent();
      if (!current) return;

      const prevIdx = findPrevSiblingIndex(current);
      if (prevIdx !== -1) {
        setIndex(prevIdx);
      } else if (wrap && flatList.length > 0) {
        setIndex(flatList.length - 1);
      }
    },

    parent() {
      const current = getCurrent();
      if (!current) return;

      const parentIdx = findParentIndex(current);
      if (parentIdx !== -1) {
        setIndex(parentIdx);
      }
    },

    firstChild() {
      const current = getCurrent();
      if (!current) return;

      const childIdx = findFirstChildIndex(current);
      if (childIdx !== -1) {
        setIndex(childIdx);
      }
    },

    goTo(index: number) {
      if (index >= 0 && index < flatList.length) {
        setIndex(index);
      }
    },

    goToSlug(slug: string) {
      const idx = flatList.findIndex((n) => n.slug === slug);
      if (idx !== -1) {
        setIndex(idx);
      }
    },

    reset() {
      setIndex(flatList.length > 0 ? 0 : -1);
    },
  };

  return navigator;
}
