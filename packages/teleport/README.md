# teleport

Keyboard bindings that wire to compass navigators.

## Layers

```
Layer 1: Key bindings (pure functions)
Layer 2a: DOM adapter (applies highlight class, scrollIntoView)
Layer 2b: State callbacks (wire to React/Vue/etc state)
Layer 3: Full integration (batteries included)
```

Layer 2a applies state directly to the DOM via classes. Layer 2b instead calls back into your framework's state system, letting you manage highlight state in React, Vue, or whatever you're using.

## API

```typescript
// Layer 1: Keyboard event handling
interface KeyBindings {
  next?: string[];      // default ['j', 'ArrowDown']
  prev?: string[];      // default ['k', 'ArrowUp']
  select?: string[];    // default ['Enter']
  nextGroup?: string[]; // default [']]', 'Tab']
  prevGroup?: string[]; // default ['[[', 'Shift+Tab']
  escape?: string[];    // default ['Escape']
}

function createKeyboardHandler(config: {
  bindings?: KeyBindings;
  onNext?: () => void;
  onPrev?: () => void;
  onSelect?: () => void;
  onNextGroup?: () => void;
  onPrevGroup?: () => void;
  onEscape?: () => void;
  ignoreWhenTyping?: boolean;  // default true
}): {
  handleKeydown: (event: KeyboardEvent) => void;
  destroy: () => void;
};

// Layer 2: DOM adapter
function createDOMNavigator(config: {
  getItems: () => HTMLElement[];
  highlightClass?: string;     // default 'highlight'
  activeClass?: string;        // default 'active'
  scrollBehavior?: ScrollIntoViewOptions;
  onSelect?: (item: HTMLElement) => void;
}): {
  navigator: Navigator<HTMLElement>;
  highlight(index: number): void;
  clearHighlight(): void;
};

// Layer 3: Full integration
function initTeleport(config: {
  itemSelector: string;
  groupSelector?: string;
  highlightClass?: string;
  bindings?: KeyBindings;
  onSelect?: (item: HTMLElement) => void;
}): {
  destroy: () => void;
};
```

## Astro Integration

```astro
---
import { Teleport } from 'astro-teleport';
---
<Teleport
  itemSelector=".nav-item"
  groupSelector=".nav-section-title"
/>
```
