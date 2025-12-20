# @bearing-dev/compass

Headless navigation cursor for ordered and nested content.

Designed for documentation sites, learning paths, keyboard-driven navigation, terminal UIs, and anywhere you need to traverse structured content without coupling to a framework or DOM.

```typescript
const nav = createNavigator({ items: ['a', 'b', 'c'] });

nav.next();    // move forward
nav.prev();    // move back
nav.current;   // where you are now
```

Works with nested items too:

```typescript
const nav = createNavigator({
  items: [
    { slug: 'ch-1', children: ['1.1', '1.2'] },
    { slug: 'ch-2' }
  ]
});

nav.next();       // ch-1 → 1.1
nav.parent();     // 1.1 → ch-1
nav.firstChild(); // ch-1 → 1.1
```

## Options

- `wrap` - loop around at the ends (default: true)
- `leavesOnly` - skip parents, only visit leaves

## Prior Art

- **Roving tabindex** — The accessibility pattern where one item in a widget is tabbable at a time, arrow keys move focus. Compass implements this logic headlessly.
- **Screen reader navigation** — VoiceOver/NVDA let users jump by granularity (character → word → paragraph → heading). A future direction for Compass.
- **Emacs buffer list** — Uniform navigation interface for any list (files, search results, commits). Same idea: decouple navigation logic from content.

## Details

No framework needed. Handles edge cases like wrapping, siblings, and depth-first traversal. See [`src/types.ts`](./src/types.ts) for full API.
