# @sailkit/lantern

Theme toggle with flash-free hydration.

## Quick Start (Astro)

```astro
---
import { initScript } from '@sailkit/lantern';
import ThemeToggle from '@sailkit/lantern/ThemeToggle.astro';
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
import { initTheme, toggleTheme, getTheme } from '@sailkit/lantern';

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

## Convention

- Stores in localStorage key: `theme`
- Sets `data-theme` attribute on `<html>`
- CSS uses `[data-theme="dark"]` selectors

## Optional Example CSS

```typescript
import '@sailkit/lantern/theme-dark.css';
import '@sailkit/lantern/theme-light.css';
```

These are minimal examples. Override with your own theme CSS.
