# @bearing-dev/teleport

Vim-style keyboard navigation for any website.

## Design Philosophy

**Drop-in for any website.** Teleport is a vanilla JavaScript library that works with any DOM. Just provide CSS selectors and it handles everything else.

**Internally uses Compass.** Teleport scans the DOM and builds a navigation tree using [@bearing-dev/compass](../compass). You get hierarchical navigation for free.

**Framework-agnostic.** The core is pure JavaScript. The Astro component is a convenience wrapper.

```javascript
// Works anywhere - no framework required
import { createTeleport } from '@bearing-dev/teleport';

const teleport = createTeleport({
  itemSelector: '.nav-item',
  highlightClass: 'highlight',
});

// Cleanup when done
teleport.destroy();
```

## Quick Start (Astro)

```astro
---
import Teleport from '@bearing-dev/teleport/Teleport.astro';
---
<html>
  <body>
    <nav class="sidebar">
      <a class="nav-item" href="/page-1">Page 1</a>
      <a class="nav-item" href="/page-2">Page 2</a>
    </nav>
    <main>Content</main>
    <Teleport />
  </body>
</html>
```

## Default Bindings

| Key | Action |
|-----|--------|
| `j` / `ArrowDown` | Next item in sidebar |
| `k` / `ArrowUp` | Previous item in sidebar |
| `Ctrl+d` | Scroll content down |
| `Ctrl+u` | Scroll content up |
| `l` / `ArrowRight` | Next page |
| `h` / `ArrowLeft` | Previous page |
| `Enter` | Navigate to highlighted item |
| `t` | Open fuzzy finder (when enabled) |
| `Escape` | Clear highlight |

## Astro Component Props

```astro
<Teleport
  itemSelector=".nav-item"
  contentSelector="main"
  sidebarSelector=".sidebar"
  highlightClass="teleport-highlight"
  enableFinder={false}
/>
```

## Programmatic API

Three layers of abstraction for custom integrations:

```typescript
// Layer 3: Full integration (batteries included)
import { initTeleport } from '@bearing-dev/teleport';

const teleport = initTeleport({
  itemSelector: '.nav-item',
  onNextPage: () => router.push(nextUrl),
  onPrevPage: () => router.push(prevUrl),
  onOpenFinder: () => openFuzzyFinder(),
});

// Cleanup
teleport.destroy();

// Layer 2: DOM adapter only
import { createDOMNavigator } from '@bearing-dev/teleport';

const navigator = createDOMNavigator({
  getItems: () => document.querySelectorAll('.item'),
  highlightClass: 'my-highlight',
  onSelect: (item, index) => console.log('Selected', item),
});

navigator.next();
navigator.prev();
navigator.goTo(5);

// Layer 1: Pure key bindings
import { createKeyboardHandler, DEFAULT_BINDINGS } from '@bearing-dev/teleport';

const handler = createKeyboardHandler({
  bindings: { ...DEFAULT_BINDINGS, nextItem: ['n'] },
  onNextItem: () => navigator.next(),
  onPrevItem: () => navigator.prev(),
});

document.addEventListener('keydown', handler.handleKeydown);
```

## Custom Bindings

```typescript
import { initTeleport } from '@bearing-dev/teleport';

initTeleport({
  itemSelector: '.nav-item',
  bindings: {
    nextItem: ['n', 'ArrowDown'],
    prevItem: ['p', 'ArrowUp'],
    scrollDown: ['Ctrl+f'],
    scrollUp: ['Ctrl+b'],
  },
});
```

## Styling

Default highlight styles are injected. Override with CSS:

```css
.teleport-highlight {
  outline: 2px solid var(--color-accent);
  background-color: var(--color-accent-dim);
}
```

## Fuzzy Finder Integration

Listen for the `teleport:open-finder` event:

```javascript
document.addEventListener('teleport:open-finder', () => {
  // Open your fuzzy finder UI
  // Use @bearing-dev/compass data structure for items
});
```
