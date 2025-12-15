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
// astro.config.mjs
import { remarkMagicLinks } from '@sailkit/atlas';

export default {
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, {
        urlBuilder: (id) => `/concepts/${id}/`,
      }],
    ],
  },
};
```

## API

```typescript
remarkMagicLinks(config: {
  /** Build URL from link ID */
  urlBuilder: (id: string) => string;
  /** Syntax style: 'wiki' (default), 'colon', or 'both' */
  syntax?: 'wiki' | 'colon' | 'both';
}): RemarkPlugin;
```

## How It Works

1. You write `[[some-page]]` in markdown
2. Plugin finds the syntax in text nodes (not code blocks)
3. Transforms to `[some-page](/concepts/some-page/)` using your `urlBuilder`
