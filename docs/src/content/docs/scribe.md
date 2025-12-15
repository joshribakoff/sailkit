---
title: Scribe
description: Extract and test code from markdown documentation.
---

# Scribe

Extract and test code from markdown documentation.

> **Status**: Planned — not yet implemented

## The Problem

Documentation code examples drift out of sync with actual APIs. AI assistants and humans alike write examples that look plausible but don't compile or run correctly. Traditional testing ignores documentation entirely.

## The Solution

Scribe treats code fences as testable units:

```typescript
import { extractCodeBlocks, testCodeBlocks } from '@sailkit/scribe';

const blocks = await extractCodeBlocks('./docs/**/*.md');
const results = await testCodeBlocks(blocks);

results.forEach(result => {
  if (!result.passed) {
    console.error(`Failed: ${result.file}:${result.line}`);
  }
});
```

## Features

### Language-Aware Execution

Different strategies for different code blocks:

- **TypeScript/JavaScript**: Transpile and execute
- **Bash**: Execute in shell, verify exit code
- **JSON**: Parse and validate structure
- **Custom**: Register your own runners

### Skip Patterns

Mark blocks that shouldn't be tested:

````markdown
```typescript skip
// This example is intentionally incomplete
const partial =
```
````

### CI Integration

```bash
npx scribe test ./docs/**/*.md --fail-fast
```

## Use Cases

- **CI pipelines**: Fail builds when examples break
- **Pre-commit hooks**: Catch issues before merge
- **Documentation audits**: Find stale examples across a codebase
- **Tutorial validation**: Ensure learning materials work

## Philosophy

Documentation is code. Code should be tested. Therefore documentation should be tested.

## Dogfooding Opportunity

This documentation site itself contains dozens of code examples. Once Scribe is implemented, we can use it to verify that all the examples in these docs actually work.

## Learn More

See the full design specification in the [scribe package README](https://github.com/joshribakoff/sailkit/tree/scribe-codefence-testing/packages/scribe).
