/**
 * A page that can be matched against for 404 recovery.
 */
export interface Page {
  /** Full URL path to this page */
  url: string;
  /** Display title of the page */
  title: string;
  /** Optional section/category name */
  section?: string;
}

/**
 * A page with its match score.
 */
export interface ScoredPage extends Page {
  /** Match score from 0-1, higher is better */
  score: number;
}

/**
 * A matcher that scores how well a page matches a requested path.
 */
export interface Matcher {
  /** Calculate score from 0-1, higher is better */
  score(requestedPath: string, page: Page): number;
}

/**
 * Configuration for findMatches function.
 */
export interface FindMatchesConfig {
  /** Custom matcher to use (default: defaultMatcher) */
  matcher?: Matcher;
  /** Minimum score threshold (default: 0.15) */
  threshold?: number;
  /** Maximum number of matches to return (default: 5) */
  maxResults?: number;
}

/**
 * Configuration for creating a composite matcher.
 */
export interface CompositeMatcherConfig {
  /** The matcher to use */
  matcher: Matcher;
  /** Weight from 0-1 for this matcher's contribution to final score */
  weight: number;
}

/**
 * Configuration for the NotFound component.
 */
export interface NotFoundConfig {
  /** List of valid pages to match against */
  pages: Page[];
  /** Score threshold for auto-redirect (default: 0.6) */
  autoRedirectThreshold?: number;
  /** Maximum suggestions to show (default: 5) */
  maxSuggestions?: number;
  /** Custom matcher (default: defaultMatcher) */
  matcher?: Matcher;
  /** Delay before auto-redirect in ms (default: 1500) */
  redirectDelay?: number;
}
