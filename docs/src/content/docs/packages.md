---
title: Packages
description: Detailed documentation for each Sailkit package.
---

# Packages

Sailkit consists of seven packages. Five are implemented, two are planned. Each solves one problem well and can be used independently or together.

## Implemented Packages

### [[compass]] - Navigation State

A headless navigation state machine for nested content structures. Provides DFS traversal, prev/next neighbors, and parent/child navigation without any UI assumptions.

**Key features:**
- Stateless utility functions for SSG
- Runtime state machine for SPA navigation
- Wrap-around and leaves-only modes

### [[teleport]] - Keyboard Navigation

Vim-style keyboard bindings with DOM integration. Three layers of abstraction let you use as much or as little as you need.

**Key features:**
- `j`/`k` for item navigation
- `h`/`l` for page navigation
- Custom key bindings
- Automatic sidebar scrolling

### [[lantern]] - Theme Toggle

Dark mode done right. No flash of wrong theme, localStorage persistence, and reactive updates.

**Key features:**
- Flash prevention via inline script
- System preference detection
- Event subscription for reactive UI

### [[lighthouse]] - Smart 404

Fuzzy matching for broken URLs. Automatically redirects typos and shows suggestions for near-matches.

**Key features:**
- Levenshtein distance matching
- Token overlap scoring
- Configurable auto-redirect threshold
- Astro component included

### [[atlas]] - Magic Links

Wikipedia-style link syntax for markdown. Write `[[page]]` instead of `[page](/docs/page/)`.

**Key features:**
- Wiki syntax: `[[page]]` or `[[page|display text]]`
- Colon syntax: `[:page]` for alternative style
- Remark plugin for Astro/Next.js/etc.

## Planned Packages

### [[spyglass]] - Site Search UI

Command palette and sidebar filtering. A **UI layer** that integrates with search engines like Fuse.js, MiniSearch, or Pagefind.

**Planned features:**
- Command palette modal (⌘K)
- Inline sidebar filter mode
- Adapters for multiple search engines
- Keyboard navigation within results

### [[scribe]] - Documentation Testing

Extract and test code from markdown documentation. Prevents documentation rot by verifying code examples actually work.

**Planned features:**
- Extract code blocks from markdown
- Language-aware execution (TS, JS, bash)
- Skip patterns for incomplete examples
- CI integration

## Package Dependencies

```
atlas ─────────────────┐
lighthouse ────────────┤
lantern ───────────────┼─► Your App
teleport ──────────────┤
compass ───────────────┤
spyglass (planned) ────┤
scribe (planned) ──────┘
```

No Sailkit package depends on another. Use any combination you need.

## Comparison Table

| Package | Status | Build-time | Runtime | Astro Component | Headless |
|---------|--------|------------|---------|-----------------|----------|
| [[compass]] | Implemented | Yes | Yes | No | Yes |
| [[teleport]] | Implemented | No | Yes | Yes | Partial |
| [[lantern]] | Implemented | Partial | Yes | Yes | Yes |
| [[lighthouse]] | Implemented | No | Yes | Yes | Yes |
| [[atlas]] | Implemented | Yes | No | No | Yes |
| [[spyglass]] | Planned | No | Yes | Yes | No |
| [[scribe]] | Planned | Yes | Yes | No | Yes |

Select a package from the sidebar to learn more.
