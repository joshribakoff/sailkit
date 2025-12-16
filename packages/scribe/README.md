# @sailkit/scribe

Extract and test code fences from markdown documentation.

## Usage

```bash
npx scribe [directory]
```

Scribe scans markdown files for TypeScript/JavaScript code fences and executes them, reporting pass/fail based on exit codes.

## Inline Assertions

Use simple assertions in your code blocks:

```typescript
const result = add(1, 2)
if (result !== 3) throw new Error('Expected 3')
```

## API

```typescript
import { parseMarkdown, filterTestableBlocks, runBlocks } from '@sailkit/scribe'

const blocks = parseMarkdown(content, 'file.md')
const testable = filterTestableBlocks(blocks)
const results = await runBlocks(testable)
```
