---
title: Spyglass
description: Site search UI with fuzzy filtering and command palette.
---

# Spyglass

Site search UI with fuzzy filtering and command palette.

> **Status**: Planned — not yet implemented

## What It Does

Spyglass is a **UI layer** for site search. It provides:

- Command palette modal (⌘K)
- Sidebar filter input
- Search results rendering
- Keyboard navigation within results

Spyglass does **not** implement fuzzy matching itself. It's an adapter that integrates with existing search libraries like Fuse.js, MiniSearch, or Pagefind.

## Architecture

```
┌─────────────────────────────────────────┐
│              Spyglass UI                │
│  (modal, input, results, highlighting)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Adapter Layer                 │
│  (normalize input/output for engines)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Search Engine (BYO)             │
│  Fuse.js │ MiniSearch │ Pagefind │ etc  │
└─────────────────────────────────────────┘
```

## Why an Adapter?

Search engines have different APIs:

```typescript
// Fuse.js
fuse.search('query')

// MiniSearch
miniSearch.search('query', { fuzzy: 0.2 })

// Pagefind
await pagefind.search('query')
```

Spyglass normalizes these into a consistent interface and renders the UI.

## Integration with Sailkit

### With [[compass]]

Build searchable items from your Compass navigation structure:

```typescript
import { flattenSlugs } from '@sailkit/compass';
import { Spyglass } from '@sailkit/spyglass';

const slugs = flattenSlugs(navigation, true);
const items = slugs.map(slug => ({
  id: slug,
  title: getTitle(slug),
  url: `/docs/${slug}/`,
}));

// Pass items to your search engine, then to Spyglass
```

### With [[teleport]]

Teleport emits `teleport:open-finder` when user presses `t`. Wire it up:

```typescript
document.addEventListener('teleport:open-finder', () => {
  spyglass.open(); // opens command palette
});
```

## API Preview

```typescript
import { createSpyglass } from '@sailkit/spyglass';
import Fuse from 'fuse.js';

// Configure with your search engine
const spyglass = createSpyglass({
  engine: 'fuse',
  fuse: new Fuse(items, { keys: ['title', 'description'] }),

  // UI options
  placeholder: 'Search docs...',
  hotkey: 'mod+k',
  maxResults: 10,
});

// Open/close
spyglass.open();
spyglass.close();
spyglass.toggle();

// Events
spyglass.on('select', (item) => {
  window.location.href = item.url;
});
```

## Features

- **Multiple engines** — Adapters for Fuse.js, MiniSearch, Pagefind
- **Command palette** — Modal UI with keyboard navigation
- **Sidebar filter** — Inline filter mode
- **Hotkey support** — Configurable keyboard shortcut
- **Result highlighting** — Visual match indicators
- **Keyboard navigation** — Arrow keys, Enter to select, Escape to close

## Supported Search Engines

| Engine | Type | Best For |
|--------|------|----------|
| Fuse.js | Client-side fuzzy | Small-medium sites |
| MiniSearch | Client-side full-text | Medium sites |
| Pagefind | Static + WASM | Large sites |

## Learn More

See the full design specification in the [spyglass package README](https://github.com/joshribakoff/sailkit/tree/spyglass-fuzzy-finder/packages/spyglass).
