// Types
export type {
  Page,
  ScoredPage,
  Matcher,
  FindMatchesConfig,
  CompositeMatcherConfig,
  NotFoundConfig,
} from './types.js';

// Core functions
export { findMatches, shouldAutoRedirect } from './core.js';

// Matchers
export {
  levenshteinDistance,
  levenshteinMatcher,
  exactSlugMatcher,
  tokenOverlapMatcher,
  createCompositeMatcher,
  defaultMatcher,
} from './matchers.js';
