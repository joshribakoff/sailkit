import { describe, it, expect } from 'vitest';
import { nestCode } from './nest-code.js';

describe('nestCode', () => {
  describe('inline code', () => {
    it('level 0 returns bare inline code', () => {
      expect(nestCode(0, true)).toBe('`[[not-a-link]]`');
    });

    it('level 1 wraps in list', () => {
      expect(nestCode(1, true)).toBe('- `[[not-a-link]]`');
    });

    it('level 2 wraps in list then blockquote', () => {
      expect(nestCode(2, true)).toBe('> - `[[not-a-link]]`');
    });

    it('level 3 alternates list/blockquote/list', () => {
      expect(nestCode(3, true)).toBe('- > - `[[not-a-link]]`');
    });
  });

  describe('code block', () => {
    it('level 0 returns bare code block', () => {
      expect(nestCode(0, false)).toBe('```\n[[not-a-link]]\n```');
    });

    it('level 1 wraps in list with indentation', () => {
      expect(nestCode(1, false)).toBe('- ```\n  [[not-a-link]]\n  ```');
    });

    it('level 2 wraps in list then blockquote', () => {
      expect(nestCode(2, false)).toBe('> - ```\n>   [[not-a-link]]\n>   ```');
    });
  });

  describe('nesting pattern', () => {
    it('even levels start with list', () => {
      // Level 0: bare, Level 2: blockquote > list, Level 4: blockquote > list > blockquote > list
      const result = nestCode(4, true);
      expect(result.startsWith('> - > - ')).toBe(true);
    });

    it('odd levels start with list (outermost)', () => {
      const result = nestCode(3, true);
      expect(result.startsWith('- > - ')).toBe(true);
    });
  });
});
