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

  it('parses all four modifiers together', () => {
    expect(parseKey('Ctrl+Alt+Shift+Meta+x')).toEqual({
      key: 'x',
      ctrl: true,
      alt: true,
      shift: true,
      meta: true,
    });
  });

  it('handles modifiers in any order', () => {
    expect(parseKey('Shift+Ctrl+d')).toEqual({
      key: 'd',
      ctrl: true,
      alt: false,
      shift: true,
      meta: false,
    });
  });
});

describe('parseKey edge cases - invalid syntax', () => {
  it('throws on empty string', () => {
    expect(() => parseKey('')).toThrow('Invalid key binding: empty string');
  });

  it('throws on whitespace-only string', () => {
    expect(() => parseKey('   ')).toThrow('Invalid key binding: empty string');
  });

  it('throws on modifier-only (no key)', () => {
    expect(() => parseKey('Ctrl')).toThrow(
      'Invalid key binding "Ctrl": modifier-only binding, missing key'
    );
    expect(() => parseKey('Ctrl+Shift')).toThrow(
      'Invalid key binding "Ctrl+Shift": modifier-only binding, missing key'
    );
  });

  it('throws on trailing plus sign (empty key)', () => {
    expect(() => parseKey('Ctrl+')).toThrow(
      'Invalid key binding "Ctrl+": empty key after modifier'
    );
    expect(() => parseKey('Ctrl+Shift+')).toThrow(
      'Invalid key binding "Ctrl+Shift+": empty key after modifier'
    );
  });

  it('throws on leading plus sign', () => {
    expect(() => parseKey('+d')).toThrow(
      'Invalid key binding "+d": leading plus sign'
    );
    expect(() => parseKey('+Ctrl+d')).toThrow(
      'Invalid key binding "+Ctrl+d": leading plus sign'
    );
  });

  it('throws on consecutive plus signs', () => {
    expect(() => parseKey('Ctrl++d')).toThrow(
      'Invalid key binding "Ctrl++d": consecutive plus signs'
    );
    expect(() => parseKey('Ctrl+++d')).toThrow(
      'Invalid key binding "Ctrl+++d": consecutive plus signs'
    );
  });

  it('throws on unrecognized modifier', () => {
    expect(() => parseKey('Cntrl+d')).toThrow(
      'Invalid key binding "Cntrl+d": unrecognized modifier "Cntrl"'
    );
    expect(() => parseKey('Control+d')).toThrow(
      'Invalid key binding "Control+d": unrecognized modifier "Control"'
    );
    expect(() => parseKey('Foo+d')).toThrow(
      'Invalid key binding "Foo+d": unrecognized modifier "Foo"'
    );
  });

  it('throws on duplicate modifiers', () => {
    expect(() => parseKey('Ctrl+Ctrl+d')).toThrow(
      'Invalid key binding "Ctrl+Ctrl+d": duplicate modifier "Ctrl"'
    );
    expect(() => parseKey('Shift+Shift+d')).toThrow(
      'Invalid key binding "Shift+Shift+d": duplicate modifier "Shift"'
    );
  });

  it('throws on whitespace in binding', () => {
    expect(() => parseKey('Ctrl + d')).toThrow(
      'Invalid key binding "Ctrl + d": contains whitespace'
    );
    expect(() => parseKey(' Ctrl+d')).toThrow(
      'Invalid key binding " Ctrl+d": contains whitespace'
    );
    expect(() => parseKey('Ctrl+d ')).toThrow(
      'Invalid key binding "Ctrl+d ": contains whitespace'
    );
  });

  it('throws on plus-only string', () => {
    expect(() => parseKey('+')).toThrow(
      'Invalid key binding "+": plus sign only'
    );
    expect(() => parseKey('++')).toThrow(
      'Invalid key binding "++"'
    );
  });

  it('throws on multi-character key (likely missing plus)', () => {
    expect(() => parseKey('Ctrld')).toThrow(
      'Invalid key binding "Ctrld": key "ctrld" looks like a missing plus sign'
    );
    expect(() => parseKey('jk')).toThrow(
      'Invalid key binding "jk": key "jk" looks like a missing plus sign'
    );
  });

  it('allows valid multi-character keys like ArrowDown, Enter, Escape', () => {
    expect(() => parseKey('ArrowDown')).not.toThrow();
    expect(() => parseKey('ArrowUp')).not.toThrow();
    expect(() => parseKey('ArrowLeft')).not.toThrow();
    expect(() => parseKey('ArrowRight')).not.toThrow();
    expect(() => parseKey('Enter')).not.toThrow();
    expect(() => parseKey('Escape')).not.toThrow();
    expect(() => parseKey('Tab')).not.toThrow();
    expect(() => parseKey('Backspace')).not.toThrow();
    expect(() => parseKey('Delete')).not.toThrow();
    expect(() => parseKey('Home')).not.toThrow();
    expect(() => parseKey('End')).not.toThrow();
    expect(() => parseKey('PageUp')).not.toThrow();
    expect(() => parseKey('PageDown')).not.toThrow();
    expect(() => parseKey('Space')).not.toThrow();
  });

  it('allows function keys F1-F12', () => {
    expect(() => parseKey('F1')).not.toThrow();
    expect(() => parseKey('F12')).not.toThrow();
    expect(() => parseKey('Ctrl+F5')).not.toThrow();
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

  it('calls onDown for j key', () => {
    const onDown = vi.fn();
    const handler = createKeyboardHandler({ onDown });

    const event = createEvent('j');
    const handled = handler.handleKeydown(event);

    expect(handled).toBe(true);
    expect(onDown).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('calls onUp for k key', () => {
    const onUp = vi.fn();
    const handler = createKeyboardHandler({ onUp });

    const event = createEvent('k');
    handler.handleKeydown(event);

    expect(onUp).toHaveBeenCalled();
  });

  it('calls onScrollDown for Ctrl+d', () => {
    const onScrollDown = vi.fn();
    const handler = createKeyboardHandler({ onScrollDown });

    const event = createEvent('d', document.createElement('div'), { ctrlKey: true });
    handler.handleKeydown(event);

    expect(onScrollDown).toHaveBeenCalled();
  });

  it('ignores keys when typing in input', () => {
    const onDown = vi.fn();
    const handler = createKeyboardHandler({ onDown });

    const input = document.createElement('input');
    const event = createEvent('j', input);
    const handled = handler.handleKeydown(event);

    expect(handled).toBe(false);
    expect(onDown).not.toHaveBeenCalled();
  });

  it('does not ignore keys when ignoreWhenTyping is false', () => {
    const onDown = vi.fn();
    const handler = createKeyboardHandler({ onDown, ignoreWhenTyping: false });

    const input = document.createElement('input');
    const event = createEvent('j', input);
    handler.handleKeydown(event);

    expect(onDown).toHaveBeenCalled();
  });

  it('supports custom bindings', () => {
    const onDown = vi.fn();
    const handler = createKeyboardHandler({
      onDown,
      bindings: { down: ['n'] },
    });

    // 'j' should no longer work
    expect(handler.handleKeydown(createEvent('j'))).toBe(false);

    // 'n' should work
    expect(handler.handleKeydown(createEvent('n'))).toBe(true);
    expect(onDown).toHaveBeenCalled();
  });
});

describe('DEFAULT_BINDINGS', () => {
  it('has all expected bindings', () => {
    expect(DEFAULT_BINDINGS.down).toContain('j');
    expect(DEFAULT_BINDINGS.up).toContain('k');
    expect(DEFAULT_BINDINGS.scrollDown).toContain('Ctrl+d');
    expect(DEFAULT_BINDINGS.scrollUp).toContain('Ctrl+u');
    expect(DEFAULT_BINDINGS.right).toContain('l');
    expect(DEFAULT_BINDINGS.left).toContain('h');
    expect(DEFAULT_BINDINGS.select).toContain('Enter');
    expect(DEFAULT_BINDINGS.toggleSidebar).toContain('t');
    expect(DEFAULT_BINDINGS.openFinder).toContain('/');
    expect(DEFAULT_BINDINGS.escape).toContain('Escape');
  });
});
