# lighthouse

404 recovery with fuzzy matching and auto-redirect.

## What Ships

```
lighthouse/
├── core.ts              # findMatches, calculateSimilarity
├── matchers/
│   ├── levenshtein.ts   # Built-in Levenshtein matcher
│   └── fuzzysort.ts     # Adapter for fuzzysort library
├── 404.astro            # Drop-in 404 page
└── styles.css           # Default 404 styling
```

## API

```typescript
interface Page {
  url: string;
  title: string;
  section?: string;
}

interface Matcher {
  score(requestedPath: string, page: Page): number;  // 0-1, higher is better
}

const levenshteinMatcher: Matcher;
const fuzzysortMatcher: Matcher;  // requires fuzzysort peer dep

function findMatches(
  requestedPath: string,
  pages: Page[],
  matcher?: Matcher,
  threshold?: number
): Array<Page & { score: number }>;

function createCompositeMatcher(strategies: {
  matcher: Matcher;
  weight: number;
}[]): Matcher;

// Pre-built composite
const defaultMatcher = createCompositeMatcher([
  { matcher: exactSlugMatcher, weight: 0.6 },
  { matcher: levenshteinMatcher, weight: 0.2 },
  { matcher: tokenOverlapMatcher, weight: 0.2 },
]);
```

## Astro Integration

```astro
// src/pages/404.astro
---
import NotFound from '@sailkit/lighthouse/NotFound.astro';
import Layout from '../layouts/Layout.astro';

const pages = posts.map(p => ({
  url: `/posts/${p.slug}/`,
  title: p.data.title,
  section: 'Posts'
}));
---
<Layout title="Page Not Found">
  <NotFound
    pages={pages}
    autoRedirectThreshold={0.6}
    maxSuggestions={5}
  >
    <Fragment slot="actions">
      <a href="/" class="btn">Go Home</a>
      <a href="/posts/" class="btn">Browse Posts</a>
    </Fragment>
  </NotFound>
</Layout>
```

## Behavior

1. On 404 load, runs fuzzy match against `pages`
2. If single match OR (score > threshold AND clear winner): auto-redirect with notice
3. Otherwise: show suggestion list
4. Low/no matches: show default actions only
