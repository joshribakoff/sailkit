import { describe, it, expect } from 'vitest';
import { createLinkResolver } from './link-resolver.js';
import type { LinkTarget } from './types.js';

describe('createLinkResolver', () => {
  const targets: LinkTarget[] = [
    {
      id: 'context-collapse',
      slug: 'context-collapse',
      url: '/concepts/context-collapse/',
      aliases: ['context-loss', 'ctx-collapse'],
    },
    {
      id: 'hallucination',
      slug: 'hallucination',
      url: '/concepts/hallucination/',
    },
    {
      id: 'future-concept',
      slug: 'future-concept',
      url: '/concepts/future-concept/',
      placeholder: true,
    },
  ];

  const resolver = createLinkResolver(targets);

  describe('resolve', () => {
    it('resolves exact ID match', () => {
      const result = resolver.resolve('context-collapse');
      expect(result.status).toBe('resolved');
      if (result.status === 'resolved') {
        expect(result.target.url).toBe('/concepts/context-collapse/');
      }
    });

    it('resolves case-insensitively', () => {
      const result = resolver.resolve('Context-Collapse');
      expect(result.status).toBe('resolved');
    });

    it('resolves by alias', () => {
      const result = resolver.resolve('context-loss');
      expect(result.status).toBe('resolved');
      if (result.status === 'resolved') {
        expect(result.target.id).toBe('context-collapse');
      }
    });

    it('resolves by slug when ID not found', () => {
      const result = resolver.resolve('hallucination');
      expect(result.status).toBe('resolved');
      if (result.status === 'resolved') {
        expect(result.target.url).toBe('/concepts/hallucination/');
      }
    });

    it('returns placeholder status for placeholder targets', () => {
      const result = resolver.resolve('future-concept');
      expect(result.status).toBe('placeholder');
      if (result.status === 'placeholder') {
        expect(result.target.placeholder).toBe(true);
      }
    });

    it('returns unresolved for unknown IDs', () => {
      const result = resolver.resolve('nonexistent');
      expect(result.status).toBe('unresolved');
      if (result.status === 'unresolved') {
        expect(result.id).toBe('nonexistent');
      }
    });
  });

  describe('resolveFirst', () => {
    it('resolves the first matching ID', () => {
      const result = resolver.resolveFirst(['nonexistent', 'context-collapse', 'hallucination']);
      expect(result.status).toBe('resolved');
      if (result.status === 'resolved') {
        expect(result.target.id).toBe('context-collapse');
      }
    });

    it('returns unresolved if none match', () => {
      const result = resolver.resolveFirst(['foo', 'bar', 'baz']);
      expect(result.status).toBe('unresolved');
      if (result.status === 'unresolved') {
        expect(result.id).toBe('foo');
      }
    });

    it('handles empty array', () => {
      const result = resolver.resolveFirst([]);
      expect(result.status).toBe('unresolved');
    });

    it('supports alias fallback', () => {
      const result = resolver.resolveFirst(['unknown', 'ctx-collapse']);
      expect(result.status).toBe('resolved');
      if (result.status === 'resolved') {
        expect(result.target.id).toBe('context-collapse');
      }
    });
  });
});
