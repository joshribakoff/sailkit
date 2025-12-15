# atlas

Wikipedia-style magic links with build-time resolution and broken link detection.

## What Ships

```
atlas/
├── remark-magic-links.mjs   # Transforms :id and [[id]] syntax to URLs
├── link-resolver.ts         # Core resolution logic
├── link-checker.ts          # Broken link detection + reporting
└── index.ts                 # Unified API
```

## Link Syntax

```markdown
<!-- Colon syntax -->
Check out [:context] for more info.
See [:context|:ctx|:context-management] for fallback resolution.

<!-- Wiki bracket syntax -->
Check out [[context]] for more info.
[[context|Learn about context]] with custom display text.
```

## API

```typescript
interface LinkTarget {
  id: string;
  slug: string;
  url: string;
  aliases?: string[];
  placeholder?: boolean;
}

type ResolveResult =
  | { status: 'resolved'; target: LinkTarget; matchedId: string }
  | { status: 'placeholder'; target: LinkTarget; matchedId: string }
  | { status: 'unresolved'; id: string };

function createLinkResolver(targets: LinkTarget[]): {
  resolve(id: string): ResolveResult;
  resolveFirst(ids: string[]): ResolveResult;
};

function remarkMagicLinks(config: {
  targets: LinkTarget[];
  syntax?: 'colon' | 'wiki' | 'both';
  unresolvedBehavior?: 'text' | 'warn' | 'error';
  placeholderClass?: string;
}): RemarkPlugin;

function checkLinks(config: {
  contentDir: string;
  targets: LinkTarget[];
}): {
  broken: { file: string; line: number; id: string }[];
  placeholders: { file: string; line: number; id: string }[];
};
```

## Resolution Priority

1. Exact `id` match
2. Match in `aliases` array
3. Slug fallback
4. Unresolved → plain text (graceful degradation)

## Usage

```javascript
// astro.config.mjs
import { remarkMagicLinks } from 'atlas';

const targets = concepts.map(c => ({
  id: c.data.id || c.slug,
  slug: c.slug,
  url: `/concepts/${c.slug}/`,
  aliases: c.data.aliases,
  placeholder: c.data.placeholder,
}));

export default {
  markdown: {
    remarkPlugins: [[remarkMagicLinks, { targets }]],
  },
};
```
