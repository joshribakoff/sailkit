import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { remarkMagicLinks } from './remark-magic-links.js';
import { nestCode } from './test-utils/nest-code.js';

const urlBuilder = (id: string) => `/concepts/${id}/`;

async function process(markdown: string, config: Partial<Parameters<typeof remarkMagicLinks>[0]> = {}) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMagicLinks, { urlBuilder, ...config })
    .use(remarkStringify)
    .process(markdown);
  return String(result);
}

describe('remarkMagicLinks', () => {
  describe('wiki syntax (default)', () => {
    it('transforms [[id]] to links', async () => {
      const result = await process('Check out [[context-collapse]] for more info.');
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
    });

    it('supports custom display text [[id|text]]', async () => {
      const result = await process('Learn about [[hallucination|AI hallucinations]].');
      expect(result).toContain('[AI hallucinations](/concepts/hallucination/)');
    });

    it('handles multiple links in same paragraph', async () => {
      const result = await process('See [[foo]] and [[bar]] for details.');
      expect(result).toContain('[foo](/concepts/foo/)');
      expect(result).toContain('[bar](/concepts/bar/)');
    });
  });

  describe('colon syntax', () => {
    it('transforms [:id] to links', async () => {
      const result = await process('Check out [:context-collapse] for more info.', { syntax: 'colon' });
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
    });

    it('supports custom display text [:id|text]', async () => {
      const result = await process('Learn about [:hallucination|AI hallucinations].', { syntax: 'colon' });
      expect(result).toContain('[AI hallucinations](/concepts/hallucination/)');
    });
  });

  describe('both syntax', () => {
    it('handles mixed syntax in same document', async () => {
      const result = await process(
        'First [:foo] and then [[bar]].',
        { syntax: 'both' }
      );
      expect(result).toContain('[foo](/concepts/foo/)');
      expect(result).toContain('[bar](/concepts/bar/)');
    });
  });

  describe('edge cases', () => {
    it('handles link at start of text', async () => {
      const result = await process('[[foo]] is important.');
      expect(result).toContain('[foo](/concepts/foo/)');
    });

    it('handles link at end of text', async () => {
      const result = await process('Learn about [[foo]]');
      expect(result).toContain('[foo](/concepts/foo/)');
    });

    it('preserves surrounding text', async () => {
      const result = await process('Before [[foo]] after.');
      expect(result).toContain('Before');
      expect(result).toContain('after');
    });

    it('handles text with no magic links', async () => {
      const result = await process('Just regular text here.');
      expect(result).toContain('Just regular text here.');
    });

    it('does not match inside code blocks', async () => {
      const result = await process('```\n[[not-a-link]]\n```');
      expect(result).toContain('[[not-a-link]]');
      expect(result).not.toContain('/concepts/not-a-link/');
    });

    it('does not match inside inline code', async () => {
      const result = await process('Use `[[syntax]]` for links.');
      expect(result).toContain('`[[syntax]]`');
    });

    it.each([1, 2, 3, 4, 5])('code block at %i nesting levels', async (levels) => {
      const input = nestCode(levels, false);
      const result = await process(input);
      expect(result).toContain('[[not-a-link]]');
      expect(result).not.toContain('/concepts/not-a-link/');
    });

    it.each([1, 2, 3, 4, 5])('inline code at %i nesting levels', async (levels) => {
      const input = nestCode(levels, true);
      const result = await process(input);
      expect(result).toContain('[[not-a-link]]');
      expect(result).not.toContain('/concepts/not-a-link/');
    });
  });

  describe('urlBuilder callback', () => {
    it('uses custom urlBuilder', async () => {
      const customBuilder = (id: string) => `/custom/${id}.html`;
      const result = await unified()
        .use(remarkParse)
        .use(remarkMagicLinks, { urlBuilder: customBuilder })
        .use(remarkStringify)
        .process('See [[my-page]] here.');
      expect(String(result)).toContain('[my-page](/custom/my-page.html)');
    });
  });
});
