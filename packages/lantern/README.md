# @bearing-dev/lantern

Theme toggle with flash-free hydration.

## Quick Start (Astro)

```astro
---
import { initScript } from '@bearing-dev/lantern';
import ThemeToggle from '@bearing-dev/lantern/ThemeToggle.astro';
---
<html>
  <head>
    <script is:inline set:html={initScript} />
  </head>
  <body>
    <ThemeToggle />
  </body>
</html>
```

## API

```typescript
import { initTheme, toggleTheme, getTheme } from '@bearing-dev/lantern';

initTheme();       // restore from localStorage
toggleTheme();     // dark <-> light
getTheme();        // 'dark' | 'light'
```

### Functions

```typescript
function initTheme(): 'light' | 'dark';
function getTheme(): 'light' | 'dark';
function setTheme(theme: 'light' | 'dark'): void;
function toggleTheme(): 'light' | 'dark';
function onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;

const initScript: string;  // minified script for flash prevention
```

### ThemeToggle Component

```astro
<ThemeToggle />
<ThemeToggle showLabel={false} />
<ThemeToggle class="my-custom-class" />
```

## Flash Prevention

Include `initScript` before paint to prevent flash of wrong theme:

```astro
<script is:inline set:html={initScript} />
```

## Prior Art

- **`prefers-color-scheme`** — The CSS media query that detects OS preference. Lantern builds on this, adding persistence and toggle UI.
- **next-themes** — Solves the same flash-prevention problem for Next.js. Lantern is framework-agnostic.

## Convention

- Stores in localStorage key: `theme`
- Sets `data-theme` attribute on `<html>`
- CSS uses `[data-theme="dark"]` selectors

## Optional Example CSS

```typescript
import '@bearing-dev/lantern/theme-dark.css';
import '@bearing-dev/lantern/theme-light.css';
```

These are minimal examples. Override with your own theme CSS.
