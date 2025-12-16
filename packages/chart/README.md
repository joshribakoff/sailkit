# @sailkit/chart

A plug-and-play documentation website framework built on Astro that integrates all Sailkit packages out of the box.

## Vision

Chart provides a zero-config documentation website that "just works" while remaining fully customizable. Inspired by Create React App's architecture, it offers:

- **Automatic upgrades** - Stay current with the latest features and security patches without manual migration
- **Extension points** - Customize behavior through well-defined hooks and configuration without modifying core files
- **Eject capability** - When you need full control, eject to serialize all dynamic behavior into static configuration files that you own

## Architecture

### Upgrade Path (Default)

By default, your documentation site depends on `@sailkit/chart` which bundles:

- **Compass** - Keyboard-driven vim-style navigation
- **Atlas** - Magic link resolution and smart routing
- **Lighthouse** - 404 recovery and broken link detection
- **Spyglass** - Full-text search with fuzzy matching
- **Scribe** - Code fence extraction and automated testing

Updates to any of these packages flow through automatically when you update Chart.

```
your-docs/
├── content/           # Your markdown/MDX content
├── public/            # Static assets
├── sailkit.config.ts  # Extension points and overrides
└── package.json       # Just depends on @sailkit/chart
```

### Extension Points

Customize without ejecting through `sailkit.config.ts`:

```typescript
import { defineConfig } from '@sailkit/chart'

export default defineConfig({
  // Override default Compass keybindings
  compass: {
    keys: {
      search: '/',
      next: 'j',
      prev: 'k',
    }
  },

  // Custom Atlas link resolvers
  atlas: {
    resolvers: [
      myCustomResolver
    ]
  },

  // Lighthouse 404 behavior
  lighthouse: {
    fallbackPage: '/not-found',
    suggestions: true
  },

  // Spyglass search configuration
  spyglass: {
    indexFields: ['title', 'description', 'content'],
    fuzzyThreshold: 0.3
  },

  // Scribe test extraction
  scribe: {
    languages: ['typescript', 'javascript'],
    testRunner: 'vitest'
  },

  // Astro configuration passthrough
  astro: {
    site: 'https://docs.example.com'
  }
})
```

### Eject

When extension points aren't enough:

```bash
npx sailkit eject
```

This serializes all dynamic behavior into static files you control:

```
your-docs/
├── content/
├── public/
├── src/
│   ├── components/      # Ejected Sailkit components
│   ├── layouts/         # Ejected layouts
│   └── integrations/    # Ejected Astro integrations
├── astro.config.mjs     # Full Astro config (no longer wrapped)
├── sailkit.config.ts    # Still respected for remaining dynamic parts
└── package.json         # Now depends on individual @sailkit/* packages
```

After ejecting:
- You own the ejected files and can modify them freely
- Future Chart updates won't override your customizations
- You can still update individual `@sailkit/*` packages independently
- Partial eject is supported (eject only specific components)

## CLI

```bash
# Create a new documentation site
npx create-sailkit-docs my-docs

# Development server
npx sailkit dev

# Production build
npx sailkit build

# Preview production build
npx sailkit preview

# Eject (full or partial)
npx sailkit eject
npx sailkit eject --only compass,atlas

# Run Scribe tests on code fences
npx sailkit test
```

## Getting Started

```bash
npx create-sailkit-docs my-docs
cd my-docs
npm run dev
```

Your documentation site is now running with:
- Vim-style keyboard navigation
- Smart internal linking
- Full-text search
- 404 recovery
- Tested code examples

## Roadmap

- [ ] `create-sailkit-docs` CLI scaffolding tool
- [ ] Core Chart package with Astro integration
- [ ] Extension point system (`sailkit.config.ts`)
- [ ] Eject functionality with partial eject support
- [ ] Theme system with light/dark mode
- [ ] Versioned documentation support
- [ ] i18n/localization support
- [ ] API documentation generation from TypeScript
