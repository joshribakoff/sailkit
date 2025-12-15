import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDOMNavigator } from './dom.js';

describe('createDOMNavigator', () => {
  let container: HTMLElement;
  let items: HTMLElement[];

  beforeEach(() => {
    // Set up DOM
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create test items
    items = [];
    for (let i = 0; i < 5; i++) {
      const item = document.createElement('a');
      item.className = 'nav-item';
      item.textContent = `Item ${i}`;
      item.href = `/page-${i}`;
      container.appendChild(item);
      items.push(item);
    }
  });

  it('starts with no highlight', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    expect(navigator.currentIndex).toBe(-1);
    expect(navigator.currentItem).toBe(null);
  });

  it('next() highlights first item when starting from no highlight', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.next();

    expect(navigator.currentIndex).toBe(0);
    expect(navigator.currentItem).toBe(items[0]);
    expect(items[0].classList.contains('teleport-highlight')).toBe(true);
  });

  it('next() advances through items', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.next(); // 0
    navigator.next(); // 1
    navigator.next(); // 2

    expect(navigator.currentIndex).toBe(2);
    expect(items[2].classList.contains('teleport-highlight')).toBe(true);
    expect(items[0].classList.contains('teleport-highlight')).toBe(false);
  });

  it('next() wraps around at end', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    // Go to last item
    for (let i = 0; i < 5; i++) {
      navigator.next();
    }
    expect(navigator.currentIndex).toBe(4);

    // Wrap to start
    navigator.next();
    expect(navigator.currentIndex).toBe(0);
  });

  it('prev() highlights last item when starting from no highlight', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.prev();

    expect(navigator.currentIndex).toBe(4);
    expect(navigator.currentItem).toBe(items[4]);
  });

  it('prev() moves backwards through items', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.goTo(3);
    navigator.prev();

    expect(navigator.currentIndex).toBe(2);
  });

  it('prev() wraps around at start', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.goTo(0);
    navigator.prev();

    expect(navigator.currentIndex).toBe(4);
  });

  it('goTo() jumps to specific index', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.goTo(3);

    expect(navigator.currentIndex).toBe(3);
    expect(items[3].classList.contains('teleport-highlight')).toBe(true);
  });

  it('clear() removes highlight', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    navigator.next();
    navigator.clear();

    expect(navigator.currentIndex).toBe(-1);
    expect(items[0].classList.contains('teleport-highlight')).toBe(false);
  });

  it('uses custom highlightClass', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
      highlightClass: 'my-highlight',
    });

    navigator.next();

    expect(items[0].classList.contains('my-highlight')).toBe(true);
    expect(items[0].classList.contains('teleport-highlight')).toBe(false);
  });

  it('calls onHighlightChange callback', () => {
    const onHighlightChange = vi.fn();
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
      onHighlightChange,
    });

    navigator.next();

    expect(onHighlightChange).toHaveBeenCalledWith(items[0], 0);
  });

  it('reports correct count', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    expect(navigator.count).toBe(5);
  });

  it('refresh() updates items list', () => {
    const navigator = createDOMNavigator({
      getItems: () => Array.from(container.querySelectorAll<HTMLElement>('.nav-item')),
    });

    // Add a new item
    const newItem = document.createElement('a');
    newItem.className = 'nav-item';
    container.appendChild(newItem);

    navigator.refresh();

    expect(navigator.count).toBe(6);
  });
});
