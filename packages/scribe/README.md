# @sailkit/scribe

Test code fences from markdown documentation.

**READ-ONLY FILESYSTEM SAFE** - No temp files, no disk writes. Everything stays in memory.

## Usage

```bash
scribe <path>        # Test a file or directory
scribe docs/         # Scan all .md/.mdx files
scribe README.md     # Test a single file
```

All JavaScript/TypeScript code blocks are tested by default. Use `nocheck` to skip:

~~~markdown
```typescript nocheck
// This block won't be tested
```
~~~

## Writing Testable Examples

Code blocks should be self-contained and use assertions. Node's `assert` module is globally available:

```typescript
const items = ['a', 'b', 'c']
assert.strictEqual(items[0], 'a')
assert.deepStrictEqual(items, ['a', 'b', 'c'])
```

No import needed - `assert` is injected by scribe. Code remains copy-pasteable since `assert` is a standard Node module.

## CLI Options

- `-i, --runInBand` - Run tests sequentially (no parallelism)
- `-j, --parallel <n>` - Set number of parallel workers (default: CPU count)

## API

```typescript
import { parseMarkdown, filterTestableBlocks, runBlocks } from '@sailkit/scribe'

const blocks = parseMarkdown(content, 'file.md')
const testable = filterTestableBlocks(blocks)
const results = await runBlocks(testable)
```

## Future

Scribe will evolve beyond static analysis to enable interactive documentation:

- **In-browser execution** - Run code blocks directly on the page
- **Live verification** - See pass/fail results as you read
- **Monaco Editor integration** - Edit and re-run examples inline
- **Playground mode** - Experiment with code without leaving the docs
