import { describe, it, expect } from 'vitest';
import { findMatches, shouldAutoRedirect } from './core.js';
import type { Page, ScoredPage } from './types.js';

const pages: Page[] = [
  { url: '/concepts/hallucination/', title: 'Hallucination', section: 'Concepts' },
  { url: '/concepts/context-collapse/', title: 'Context Collapse', section: 'Concepts' },
  { url: '/patterns/context-management/', title: 'Context Management', section: 'Patterns' },
  { url: '/failure-modes/lost-in-middle/', title: 'Lost in the Middle', section: 'Failure Modes' },
  { url: '/', title: 'Home' },
];

describe('findMatches', () => {
  it('returns matches sorted by score', () => {
    const matches = findMatches('/concepts/hallucination/', pages);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].url).toBe('/concepts/hallucination/');
    expect(matches[0].score).toBe(1);
  });

  it('finds content that moved sections', () => {
    // Same slug, different section
    const matches = findMatches('/old-section/hallucination/', pages);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].url).toBe('/concepts/hallucination/');
  });

  it('filters by threshold', () => {
    const matches = findMatches('/xyz123/', pages, { threshold: 0.5 });
    // Very different path should have low scores
    expect(matches.length).toBe(0);
  });

  it('respects maxResults', () => {
    const matches = findMatches('/context/', pages, { maxResults: 2 });
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it('uses custom matcher', () => {
    const customMatcher = { score: () => 0.99 };
    const matches = findMatches('/anything/', pages, { matcher: customMatcher });
    expect(matches.every((m) => m.score === 0.99)).toBe(true);
  });
});

describe('shouldAutoRedirect', () => {
  it('returns false for no matches', () => {
    expect(shouldAutoRedirect([])).toBe(false);
  });

  it('returns true for single match', () => {
    const matches: ScoredPage[] = [{ url: '/test/', title: 'Test', score: 0.3 }];
    expect(shouldAutoRedirect(matches)).toBe(true);
  });

  it('returns true for high score clear winner', () => {
    const matches: ScoredPage[] = [
      { url: '/test1/', title: 'Test 1', score: 0.9 },
      { url: '/test2/', title: 'Test 2', score: 0.3 },
    ];
    expect(shouldAutoRedirect(matches, 0.6)).toBe(true);
  });

  it('returns false when no clear winner', () => {
    const matches: ScoredPage[] = [
      { url: '/test1/', title: 'Test 1', score: 0.7 },
      { url: '/test2/', title: 'Test 2', score: 0.65 },
    ];
    expect(shouldAutoRedirect(matches, 0.6)).toBe(false);
  });

  it('returns false when score below threshold', () => {
    const matches: ScoredPage[] = [
      { url: '/test1/', title: 'Test 1', score: 0.5 },
      { url: '/test2/', title: 'Test 2', score: 0.2 },
    ];
    expect(shouldAutoRedirect(matches, 0.6)).toBe(false);
  });
});
