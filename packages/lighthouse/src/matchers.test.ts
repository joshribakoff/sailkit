import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  levenshteinMatcher,
  exactSlugMatcher,
  tokenOverlapMatcher,
  createCompositeMatcher,
  defaultMatcher,
} from './matchers.js';
import type { Page } from './types.js';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns correct distance for single edit', () => {
    expect(levenshteinDistance('hello', 'hallo')).toBe(1);
  });

  it('returns length for completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });

  it('handles empty strings', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance('', '')).toBe(0);
  });
});

describe('levenshteinMatcher', () => {
  const page: Page = { url: '/concepts/context-collapse/', title: 'Context Collapse' };

  it('scores identical paths as 1', () => {
    expect(levenshteinMatcher.score('/concepts/context-collapse/', page)).toBe(1);
  });

  it('scores similar paths highly', () => {
    const score = levenshteinMatcher.score('/concepts/context-collaps/', page);
    expect(score).toBeGreaterThan(0.9);
  });

  it('scores very different paths low', () => {
    const score = levenshteinMatcher.score('/foo/bar/', page);
    expect(score).toBeLessThan(0.5);
  });
});

describe('exactSlugMatcher', () => {
  const page: Page = { url: '/concepts/hallucination/', title: 'Hallucination' };

  it('scores exact slug match as 1', () => {
    const score = exactSlugMatcher.score('/old-section/hallucination/', page);
    expect(score).toBe(1);
  });

  it('scores partial slug match as 0.5', () => {
    const score = exactSlugMatcher.score('/concepts/hallucinations/', page);
    expect(score).toBe(0.5);
  });

  it('scores no slug match as 0', () => {
    const score = exactSlugMatcher.score('/concepts/context/', page);
    expect(score).toBe(0);
  });
});

describe('tokenOverlapMatcher', () => {
  const page: Page = { url: '/concepts/context-collapse/', title: 'Context Collapse' };

  it('scores high when tokens overlap', () => {
    const score = tokenOverlapMatcher.score('/context-collapse/', page);
    expect(score).toBeGreaterThan(0.5);
  });

  it('scores partial token matches', () => {
    const score = tokenOverlapMatcher.score('/collapse/', page);
    expect(score).toBeGreaterThan(0);
  });

  it('scores zero for no overlap', () => {
    const score = tokenOverlapMatcher.score('/foo/bar/', page);
    expect(score).toBe(0);
  });
});

describe('createCompositeMatcher', () => {
  it('combines matchers with weights', () => {
    const page: Page = { url: '/concepts/test/', title: 'Test' };

    const composite = createCompositeMatcher([
      { matcher: { score: () => 1 }, weight: 0.5 },
      { matcher: { score: () => 0 }, weight: 0.5 },
    ]);

    expect(composite.score('/test/', page)).toBe(0.5);
  });

  it('normalizes weights', () => {
    const page: Page = { url: '/test/', title: 'Test' };

    const composite = createCompositeMatcher([
      { matcher: { score: () => 1 }, weight: 2 },
      { matcher: { score: () => 0 }, weight: 2 },
    ]);

    expect(composite.score('/test/', page)).toBe(0.5);
  });
});

describe('defaultMatcher', () => {
  const pages: Page[] = [
    { url: '/concepts/hallucination/', title: 'Hallucination' },
    { url: '/patterns/context-management/', title: 'Context Management' },
  ];

  it('prioritizes exact slug matches', () => {
    // Slug matches exactly but section different
    const score = defaultMatcher.score('/old/hallucination/', pages[0]);
    expect(score).toBeGreaterThan(0.5);
  });

  it('scores similar URLs higher than different ones', () => {
    const similar = defaultMatcher.score('/concepts/hallucinations/', pages[0]);
    const different = defaultMatcher.score('/foo/bar/', pages[0]);
    expect(similar).toBeGreaterThan(different);
  });
});
