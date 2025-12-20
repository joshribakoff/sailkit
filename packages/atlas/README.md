# atlas

Remark plugin for Wikipedia-style magic links.

## Syntax

```markdown
<!-- Wiki syntax (default) -->
Check out [[context-collapse]] for more.
[[context-collapse|Learn about context]] with custom display text.

<!-- Colon syntax -->
Check out [:context-collapse] for more.
[:context-collapse|Learn about context] with custom display text.
```

## Usage

```javascript
import { remarkMagicLinks } from '@sailkit/atlas';

export default {
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, {
        urlBuilder: (id) => `/wiki/${id}/`,
      }],
    ],
  },
};
```

### Multi-collection routing

The `urlBuilder` receives the raw ID, so you control all resolution logic. A site with different content types can route each to different paths:

```javascript
// Imaginary pet store with fish, birds, and reptiles
const catalog = {
  'one-fish': { type: 'fish', slug: 'one-fish' },
  'two-fish': { type: 'fish', slug: 'two-fish' },
  'red-parrot': { type: 'bird', slug: 'red-parrot' },
  'blue-gecko': { type: 'reptile', slug: 'blue-gecko' },
};

urlBuilder: (id) => {
  const item = catalog[id];
  if (!item) {
    console.warn(`Broken magic link: [[${id}]]`);
    return `/404/`;
  }
  return `/${item.type}/${item.slug}/`;
}
```

Now `[[one-fish]]` → `/fish/one-fish/` and `[[blue-gecko]]` → `/reptile/blue-gecko/`.

See [`remark-magic-links.test.ts`](./src/remark-magic-links.test.ts) for more examples.

## Editor Support

The `[[wiki-link]]` syntax is a widely-adopted convention. Many editors can follow these links natively:

- **Neovim**: `Ctrl+]` jumps to the linked file
- **VS Code**: Extensions like "Markdown Links" add support

Your content stays navigable in your editor without any build step.

## Prior Art

The `[[wiki-link]]` syntax appears in many tools:

- **MediaWiki** — Wikipedia's engine uses `[[page]]` syntax
- **Org mode** — Emacs system with `[[link][desc]]` and bidirectional links
- **Roam/Obsidian** — Note-taking apps that use wiki-links

This plugin brings the same convention to static site generators.

## How It Works

1. You write `[[some-page]]` in markdown
2. Plugin finds the syntax in text nodes (not code blocks)
3. Calls your `urlBuilder(id)` to get the URL
4. Transforms to a standard markdown link
