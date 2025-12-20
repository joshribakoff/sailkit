# @bearing-dev/teleport

Vim-style keyboard navigation for any website.

## Why Teleport?

**Mousetrap maps keys to callbacks. Teleport understands navigation.**

Key binding libraries like Mousetrap are great for simple hotkeys, but they don't understand context. Teleport handles the nuances of sidebar-based navigation that you'd otherwise have to build yourself:

- **Visibility awareness**: Should `j`/`k` work when the sidebar is hidden? Teleport can ignore navigation or auto-open the sidebar.
- **State management**: Track current position, sync with URL, handle wrapping at boundaries.
- **DOM integration**: Adds a customizable class to current item, scrolls into view, ignores input fields.
- **Hierarchical navigation**: Uses [Compass](../compass) internally for tree traversal.

```javascript
// With Teleport - handles all the edge cases
const teleport = createTeleport({
  itemSelector: '.nav-item',
  sidebarSelector: '.sidebar',
  whenHidden: 'show-sidebar', // j/k auto-opens sidebar if hidden
});

// With Mousetrap - you build all this yourself
Mousetrap.bind('j', () => {
  if (isInputFocused()) return;
  if (!isSidebarVisible()) {
    // open sidebar? ignore? you decide...
  }
  // move class to new element
  // scroll into view
  // sync with URL...
});
```

## Prior Art

- **Vimium** — Browser extension adding Vim-style navigation to any webpage. Teleport is similar but site-specific: it understands your sidebar structure rather than being generic.
- **GNU Readline** — The library behind bash/REPL input (`Ctrl+a`, `Ctrl+e`, `Ctrl+w`). Emacs-style keybindings some users expect as an alternative to Vim's hjkl.

## Design Philosophy

**Drop-in for any website.** Teleport is a vanilla JavaScript library that works with any DOM. Just provide CSS selectors and it handles everything else.

**Internally uses Compass.** Teleport scans the DOM and builds a navigation tree using [@bearing-dev/compass](../compass). You get hierarchical navigation for free.

**Framework-agnostic.** The core is pure JavaScript. The Astro component is a convenience wrapper.

**Simple highlight model.** Teleport adds a CSS class to the current item. That's it. You control the styling - whether it's visible, how it looks, when to hide it. The library doesn't manage "highlight visibility" state.

## Architecture

The flow from keypress to DOM update:

```
KEYPRESS
└─► createKeyboardHandler (keys.ts)
    └─► Matches key against bindings
    └─► Calls callback (onDown, onUp, etc.)

STATE UPDATE
└─► handleNavigationAction (navigator.ts)
    └─► Checks sidebar visibility
    └─► Delegates to Compass: navigator.next() / navigator.prev()
    └─► Compass fires onChange callback

DOM UPDATE
└─► updateHighlight (navigator.ts)
    └─► Moves highlight class to current item
    └─► Scrolls item into view
```

**Single sources of truth:**
- **Key bindings**: `createKeyboardHandler()` in `keys.ts`
- **Navigation state**: Compass `createNavigator()` - Teleport never maintains its own index
- **DOM updates**: `updateHighlight()` in `navigator.ts`

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
    <Teleport sidebarSelector=".sidebar" />
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
| `t` | Toggle sidebar |
| `/` | Open fuzzy finder (when enabled) |

## Sidebar Visibility

When you provide a `sidebarSelector`, Teleport becomes visibility-aware. This works the same whether the sidebar is hidden due to a responsive breakpoint or user toggle:

- **Sidebar visible**: j/k/arrows navigate the sidebar
- **Sidebar hidden**: arrows pass through for native scroll, j/k do nothing, press `t` to toggle sidebar back

The `whenHidden` option controls navigation key behavior when sidebar is hidden:

```javascript
createTeleport({
  itemSelector: '.nav-item',
  sidebarSelector: '.sidebar',

  // 'ignore' (default) - arrows scroll natively, j/k/Enter do nothing
  whenHidden: 'ignore',

  // 'show-sidebar' - j/k/arrows/Enter auto-open sidebar, then navigate
  whenHidden: 'show-sidebar',
});
```

Teleport detects hidden sidebars via:
- `display: none`
- `visibility: hidden`
- `opacity: 0`
- `.hidden` or `.collapsed` classes
- `hidden` attribute
- `translateX(-...)` transforms

## Astro Component Props

```astro
<Teleport
  itemSelector=".nav-item"
  sidebarSelector=".sidebar"
  highlightClass="teleport-highlight"
  wrap={true}
  whenHidden="ignore"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `itemSelector` | `string` | `'.nav-item'` | CSS selector for navigable items |
| `sidebarSelector` | `string` | — | CSS selector for sidebar (enables visibility awareness) |
| `highlightClass` | `string` | `'teleport-highlight'` | Class added to highlighted item |
| `wrap` | `boolean` | `true` | Wrap around at list boundaries |
| `whenHidden` | `'ignore' \| 'show-sidebar'` | `'ignore'` | Behavior when sidebar is hidden |

## Programmatic API

```typescript
import { createTeleport } from '@bearing-dev/teleport';

const teleport = createTeleport({
  itemSelector: '.nav-item',
  sidebarSelector: '.sidebar',
  whenHidden: 'show-sidebar',
  onSelect: (el, slug) => console.log('Selected', slug),
  onToggleSidebar: () => document.body.classList.toggle('sidebar-open'),
});

// Access Compass navigator
teleport.navigator.current; // current slug
teleport.navigator.next();  // move to next

// Refresh after DOM changes
teleport.refresh();

// Cleanup
teleport.destroy();
```

## Low-Level API

For custom integrations, use the key binding layer directly:

```typescript
import { createKeyboardHandler, DEFAULT_BINDINGS } from '@bearing-dev/teleport';

const handler = createKeyboardHandler({
  bindings: DEFAULT_BINDINGS,
  onDown: () => console.log('down'),
  onUp: () => console.log('up'),
  onToggleSidebar: () => console.log('toggle'),
});

document.addEventListener('keydown', handler.handleKeydown);
```

## Custom Bindings

```typescript
createTeleport({
  itemSelector: '.nav-item',
  bindings: {
    down: ['n', 'ArrowDown'],
    up: ['p', 'ArrowUp'],
    scrollDown: ['Ctrl+f'],
    scrollUp: ['Ctrl+b'],
  },
});
```

## Styling

Teleport adds the highlight class to the current item. You provide the styles:

```css
/* Basic highlight */
.teleport-highlight {
  outline: 2px solid var(--color-accent);
  background-color: var(--color-accent-dim);
}

/* Or use a custom class name */
createTeleport({
  itemSelector: '.nav-item',
  highlightClass: 'my-custom-highlight', // default: 'teleport-highlight'
});
```

## Events

Teleport emits custom events for integration:

```javascript
// Sidebar toggle (default behavior if no onToggleSidebar callback)
document.addEventListener('teleport:toggle-sidebar', () => {
  document.body.classList.toggle('sidebar-open');
});

// Fuzzy finder (when / is pressed)
document.addEventListener('teleport:open-finder', () => {
  // Open your fuzzy finder UI
});
```
