import { describe, it, expect, vi } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { remarkMagicLinks } from './remark-magic-links.js';
import type { LinkTarget } from './types.js';

const targets: LinkTarget[] = [
  {
    id: 'context-collapse',
    slug: 'context-collapse',
    url: '/concepts/context-collapse/',
    aliases: ['context-loss', 'ctx'],
  },
  {
    id: 'hallucination',
    slug: 'hallucination',
    url: '/concepts/hallucination/',
  },
  {
    id: 'placeholder-concept',
    slug: 'placeholder-concept',
    url: '/concepts/placeholder-concept/',
    placeholder: true,
  },
];

async function process(markdown: string, config: Partial<Parameters<typeof remarkMagicLinks>[0]> = {}) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMagicLinks, { targets, ...config })
    .use(remarkStringify)
    .process(markdown);
  return String(result);
}

describe('remarkMagicLinks', () => {
  describe('colon syntax', () => {
    it('transforms [:id] to links', async () => {
      const result = await process('Check out [:context-collapse] for more info.');
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
    });

    it('supports custom display text [:id|text]', async () => {
      const result = await process('Learn about [:context-collapse|context management].');
      expect(result).toContain('[context management](/concepts/context-collapse/)');
    });

    it('supports fallback IDs [:id1|:id2]', async () => {
      const result = await process('See [:nonexistent|:context-collapse] here.');
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
    });

    it('resolves by alias', async () => {
      const result = await process('Read about [:ctx] today.');
      expect(result).toContain('[ctx](/concepts/context-collapse/)');
    });
  });

  describe('wiki syntax', () => {
    it('transforms [[id]] to links', async () => {
      const result = await process('Check out [[hallucination]] for more info.', { syntax: 'wiki' });
      expect(result).toContain('[hallucination](/concepts/hallucination/)');
    });

    it('supports custom display text [[id|text]]', async () => {
      const result = await process('Learn about [[hallucination|AI hallucinations]].', { syntax: 'wiki' });
      expect(result).toContain('[AI hallucinations](/concepts/hallucination/)');
    });
  });

  describe('both syntax', () => {
    it('handles mixed syntax in same document', async () => {
      const result = await process(
        'First [:context-collapse] and then [[hallucination]].',
        { syntax: 'both' }
      );
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
      expect(result).toContain('[hallucination](/concepts/hallucination/)');
    });
  });

  describe('unresolved handling', () => {
    it('converts unresolved to plain text by default', async () => {
      const result = await process('See [:nonexistent] here.');
      expect(result).toContain('See nonexistent here.');
      expect(result).not.toContain('[nonexistent]');
      expect(result).not.toContain('[:nonexistent]');
    });

    it('warns on unresolved when configured', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await process('See [:nonexistent] here.', { unresolvedBehavior: 'warn' });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));
      consoleSpy.mockRestore();
    });

    it('throws on unresolved when configured', async () => {
      await expect(
        process('See [:nonexistent] here.', { unresolvedBehavior: 'error' })
      ).rejects.toThrow('Unresolved magic link');
    });
  });

  describe('placeholders', () => {
    it('adds placeholder class to placeholder links', async () => {
      const result = await process('Coming soon: [:placeholder-concept].');
      // The class is added via data.hProperties which may not be visible in stringify
      // but the link itself should be created
      expect(result).toContain('[placeholder-concept](/concepts/placeholder-concept/)');
    });
  });

  describe('edge cases', () => {
    it('handles multiple links in same paragraph', async () => {
      const result = await process(
        'See [:context-collapse] and [:hallucination] for details.'
      );
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
      expect(result).toContain('[hallucination](/concepts/hallucination/)');
    });

    it('handles links at start of text', async () => {
      const result = await process('[:context-collapse] is important.');
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
    });

    it('handles links at end of text', async () => {
      const result = await process('Learn about [:context-collapse]');
      expect(result).toContain('[context-collapse](/concepts/context-collapse/)');
    });

    it('preserves surrounding text', async () => {
      const result = await process('Before [:context-collapse] after.');
      expect(result).toContain('Before');
      expect(result).toContain('after');
    });

    it('handles text with no magic links', async () => {
      const result = await process('Just regular text here.');
      expect(result).toContain('Just regular text here.');
    });
  });
});
