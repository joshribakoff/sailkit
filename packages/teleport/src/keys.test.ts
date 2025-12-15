import { describe, it, expect, vi } from 'vitest';
import {
  parseKey,
  matchesKey,
  matchesAnyKey,
  isTypingContext,
  createKeyboardHandler,
  DEFAULT_BINDINGS,
} from './keys.js';

describe('parseKey', () => {
  it('parses simple keys', () => {
    expect(parseKey('j')).toEqual({
      key: 'j',
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    });
  });

  it('parses Ctrl modifier', () => {
    expect(parseKey('Ctrl+d')).toEqual({
      key: 'd',
      ctrl: true,
      alt: false,
      shift: false,
      meta: false,
    });
  });

  it('parses multiple modifiers', () => {
    expect(parseKey('Ctrl+Shift+k')).toEqual({
      key: 'k',
      ctrl: true,
      alt: false,
      shift: true,
      meta: false,
    });
  });

  it('parses Meta/Cmd modifier', () => {
    expect(parseKey('Meta+k')).toEqual({
      key: 'k',
      ctrl: false,
      alt: false,
      shift: false,
      meta: true,
    });

    expect(parseKey('Cmd+k')).toEqual({
      key: 'k',
      ctrl: false,
      alt: false,
      shift: false,
      meta: true,
    });
  });

  it('parses special keys', () => {
    expect(parseKey('ArrowDown')).toEqual({
      key: 'arrowdown',
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    });

    expect(parseKey('Escape')).toEqual({
      key: 'escape',
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    });
  });
});

describe('matchesKey', () => {
  function createEvent(
    key: string,
    modifiers: Partial<{
      ctrlKey: boolean;
      altKey: boolean;
      shiftKey: boolean;
      metaKey: boolean;
    }> = {}
  ): KeyboardEvent {
    return {
      key,
      ctrlKey: modifiers.ctrlKey ?? false,
      altKey: modifiers.altKey ?? false,
      shiftKey: modifiers.shiftKey ?? false,
      metaKey: modifiers.metaKey ?? false,
    } as KeyboardEvent;
  }

  it('matches simple keys', () => {
    const parsed = parseKey('j');
    expect(matchesKey(createEvent('j'), parsed)).toBe(true);
    expect(matchesKey(createEvent('k'), parsed)).toBe(false);
  });

  it('matches keys with modifiers', () => {
    const parsed = parseKey('Ctrl+d');
    expect(matchesKey(createEvent('d', { ctrlKey: true }), parsed)).toBe(true);
    expect(matchesKey(createEvent('d'), parsed)).toBe(false);
    expect(matchesKey(createEvent('d', { ctrlKey: true, shiftKey: true }), parsed)).toBe(
      false
    );
  });

  it('is case insensitive for key matching', () => {
    const parsed = parseKey('j');
    expect(matchesKey(createEvent('J'), parsed)).toBe(true);
  });
});

describe('matchesAnyKey', () => {
  function createEvent(key: string): KeyboardEvent {
    return { key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as KeyboardEvent;
  }

  it('matches any pattern in the list', () => {
    expect(matchesAnyKey(createEvent('j'), ['j', 'ArrowDown'])).toBe(true);
    expect(matchesAnyKey(createEvent('ArrowDown'), ['j', 'ArrowDown'])).toBe(true);
    expect(matchesAnyKey(createEvent('k'), ['j', 'ArrowDown'])).toBe(false);
  });
});

describe('isTypingContext', () => {
  it('returns true for input elements', () => {
    const input = document.createElement('input');
    const event = { target: input } as KeyboardEvent;
    expect(isTypingContext(event)).toBe(true);
  });

  it('returns true for textarea elements', () => {
    const textarea = document.createElement('textarea');
    const event = { target: textarea } as KeyboardEvent;
    expect(isTypingContext(event)).toBe(true);
  });

  it('returns true for contenteditable elements', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    const event = { target: div } as KeyboardEvent;
    expect(isTypingContext(event)).toBe(true);
  });

  it('returns false for regular elements', () => {
    const div = document.createElement('div');
    const event = { target: div } as KeyboardEvent;
    expect(isTypingContext(event)).toBe(false);
  });
});

describe('createKeyboardHandler', () => {
  function createEvent(
    key: string,
    target: HTMLElement = document.createElement('div'),
    modifiers: Partial<{
      ctrlKey: boolean;
    }> = {}
  ): KeyboardEvent {
    return {
      key,
      target,
      ctrlKey: modifiers.ctrlKey ?? false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
  }

  it('calls onNextItem for j key', () => {
    const onNextItem = vi.fn();
    const handler = createKeyboardHandler({ onNextItem });

    const event = createEvent('j');
    const handled = handler.handleKeydown(event);

    expect(handled).toBe(true);
    expect(onNextItem).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('calls onPrevItem for k key', () => {
    const onPrevItem = vi.fn();
    const handler = createKeyboardHandler({ onPrevItem });

    const event = createEvent('k');
    handler.handleKeydown(event);

    expect(onPrevItem).toHaveBeenCalled();
  });

  it('calls onScrollDown for Ctrl+d', () => {
    const onScrollDown = vi.fn();
    const handler = createKeyboardHandler({ onScrollDown });

    const event = createEvent('d', document.createElement('div'), { ctrlKey: true });
    handler.handleKeydown(event);

    expect(onScrollDown).toHaveBeenCalled();
  });

  it('ignores keys when typing in input', () => {
    const onNextItem = vi.fn();
    const handler = createKeyboardHandler({ onNextItem });

    const input = document.createElement('input');
    const event = createEvent('j', input);
    const handled = handler.handleKeydown(event);

    expect(handled).toBe(false);
    expect(onNextItem).not.toHaveBeenCalled();
  });

  it('does not ignore keys when ignoreWhenTyping is false', () => {
    const onNextItem = vi.fn();
    const handler = createKeyboardHandler({ onNextItem, ignoreWhenTyping: false });

    const input = document.createElement('input');
    const event = createEvent('j', input);
    handler.handleKeydown(event);

    expect(onNextItem).toHaveBeenCalled();
  });

  it('supports custom bindings', () => {
    const onNextItem = vi.fn();
    const handler = createKeyboardHandler({
      onNextItem,
      bindings: { nextItem: ['n'] },
    });

    // 'j' should no longer work
    expect(handler.handleKeydown(createEvent('j'))).toBe(false);

    // 'n' should work
    expect(handler.handleKeydown(createEvent('n'))).toBe(true);
    expect(onNextItem).toHaveBeenCalled();
  });
});

describe('DEFAULT_BINDINGS', () => {
  it('has all expected bindings', () => {
    expect(DEFAULT_BINDINGS.nextItem).toContain('j');
    expect(DEFAULT_BINDINGS.prevItem).toContain('k');
    expect(DEFAULT_BINDINGS.scrollDown).toContain('Ctrl+d');
    expect(DEFAULT_BINDINGS.scrollUp).toContain('Ctrl+u');
    expect(DEFAULT_BINDINGS.nextPage).toContain('l');
    expect(DEFAULT_BINDINGS.prevPage).toContain('h');
    expect(DEFAULT_BINDINGS.select).toContain('Enter');
    expect(DEFAULT_BINDINGS.openFinder).toContain('t');
    expect(DEFAULT_BINDINGS.escape).toContain('Escape');
  });
});
