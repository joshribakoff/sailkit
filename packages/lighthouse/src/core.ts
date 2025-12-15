import type { Page, ScoredPage, FindMatchesConfig } from './types.js';
import { defaultMatcher } from './matchers.js';

/**
 * Find pages that best match the requested path.
 * Returns matches sorted by score (highest first), filtered by threshold.
 */
export function findMatches(
  requestedPath: string,
  pages: Page[],
  config: FindMatchesConfig = {}
): ScoredPage[] {
  const { matcher = defaultMatcher, threshold = 0.15, maxResults = 5 } = config;

  // Score all pages
  const scored: ScoredPage[] = pages.map((page) => ({
    ...page,
    score: matcher.score(requestedPath, page),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Filter by threshold and limit results
  return scored.filter((p) => p.score > threshold).slice(0, maxResults);
}

/**
 * Determine if we should auto-redirect based on matches.
 * Auto-redirect if:
 * 1. Single match (only one result above threshold)
 * 2. OR strong match with clear winner (high score AND significantly better than alternatives)
 */
export function shouldAutoRedirect(
  matches: ScoredPage[],
  autoRedirectThreshold: number = 0.6
): boolean {
  if (matches.length === 0) return false;

  // Single match - always redirect
  if (matches.length === 1) return true;

  const bestMatch = matches[0];

  // Strong match with clear winner
  const strongMatch = bestMatch.score > autoRedirectThreshold;
  const clearWinner = matches.length > 1 && bestMatch.score > matches[1].score + 0.2;

  return strongMatch && clearWinner;
}
