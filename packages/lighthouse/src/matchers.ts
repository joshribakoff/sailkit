import type { Matcher, Page, CompositeMatcherConfig } from './types.js';

/**
 * Calculate Levenshtein distance between two strings.
 * Returns the number of single-character edits (insertions, deletions, substitutions) needed.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Levenshtein-based similarity matcher.
 * Scores based on edit distance between requested path and page URL.
 */
export const levenshteinMatcher: Matcher = {
  score(requestedPath: string, page: Page): number {
    const requested = requestedPath.toLowerCase();
    const pageUrl = page.url.toLowerCase();
    const maxLen = Math.max(requested.length, pageUrl.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(requested, pageUrl);
    return 1 - distance / maxLen;
  },
};

/**
 * Exact slug matcher.
 * Gives high score when the last path segment (slug) matches exactly.
 * Useful for detecting content that moved to a different section.
 */
export const exactSlugMatcher: Matcher = {
  score(requestedPath: string, page: Page): number {
    const requestedParts = requestedPath.toLowerCase().split('/').filter(Boolean);
    const pageParts = page.url.toLowerCase().split('/').filter(Boolean);

    const requestedSlug = requestedParts[requestedParts.length - 1];
    const pageSlug = pageParts[pageParts.length - 1];

    if (requestedSlug && pageSlug && requestedSlug === pageSlug) {
      return 1;
    }

    // Partial match - slug contains or is contained by
    if (requestedSlug && pageSlug) {
      if (pageSlug.includes(requestedSlug) || requestedSlug.includes(pageSlug)) {
        return 0.5;
      }
    }

    return 0;
  },
};

/**
 * Token overlap matcher.
 * Scores based on how many words/tokens from the URL appear in the page URL or title.
 */
export const tokenOverlapMatcher: Matcher = {
  score(requestedPath: string, page: Page): number {
    const requested = requestedPath.toLowerCase();
    const pageUrl = page.url.toLowerCase();
    const pageTitle = page.title.toLowerCase();

    // Tokenize - split on non-alphanumeric characters
    const requestedTokens = requested.split(/[^a-z0-9]+/).filter(Boolean);
    const urlTokens = pageUrl.split(/[^a-z0-9]+/).filter(Boolean);
    const titleTokens = pageTitle.split(/\s+/).filter(Boolean);
    const allPageTokens = [...urlTokens, ...titleTokens];

    if (requestedTokens.length === 0) return 0;

    let matches = 0;
    for (const reqToken of requestedTokens) {
      for (const pageToken of allPageTokens) {
        if (pageToken.includes(reqToken) || reqToken.includes(pageToken)) {
          matches++;
          break;
        }
      }
    }

    return matches / requestedTokens.length;
  },
};

/**
 * Create a composite matcher that combines multiple matchers with weights.
 */
export function createCompositeMatcher(strategies: CompositeMatcherConfig[]): Matcher {
  // Normalize weights to sum to 1
  const totalWeight = strategies.reduce((sum, s) => sum + s.weight, 0);
  const normalized = strategies.map((s) => ({
    ...s,
    weight: s.weight / totalWeight,
  }));

  return {
    score(requestedPath: string, page: Page): number {
      let totalScore = 0;
      for (const { matcher, weight } of normalized) {
        totalScore += matcher.score(requestedPath, page) * weight;
      }
      return Math.min(totalScore, 1);
    },
  };
}

/**
 * Default matcher optimized for 404 recovery.
 * Prioritizes exact slug matches (content moved), then Levenshtein similarity,
 * then token overlap.
 */
export const defaultMatcher = createCompositeMatcher([
  { matcher: exactSlugMatcher, weight: 0.6 },
  { matcher: levenshteinMatcher, weight: 0.2 },
  { matcher: tokenOverlapMatcher, weight: 0.2 },
]);
