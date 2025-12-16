import { describe, it, expect, beforeEach } from 'vitest'
import { run, type IO, type RunOptions } from './cli.js'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// Mock IO that captures output
function createMockIO(): IO & { stdout: string; stderr: string } {
  const io = {
    stdout: '',
    stderr: '',
    write(text: string) {
      io.stdout += text
    },
    writeError(text: string) {
      io.stderr += text
    }
  }
  return io
}

describe('scribe CLI', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `scribe-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
  })

  it('reports error for non-existent path', async () => {
    const io = createMockIO()
    const result = await run({ targetPath: '/nonexistent/path', concurrency: 1 }, io)

    expect(result.failed).toBe(1)
    expect(io.stderr).toContain('Error: Path not found')
  })

  it('reports no testable blocks for markdown without code fences', async () => {
    const mdPath = join(testDir, 'empty.md')
    await writeFile(mdPath, '# Hello\n\nNo code here.')

    const io = createMockIO()
    const result = await run({ targetPath: mdPath, concurrency: 1 }, io)

    expect(result.passed).toBe(0)
    expect(result.failed).toBe(0)
    expect(io.stdout).toContain('No testable code blocks found')
  })

  it('runs passing JavaScript code blocks', async () => {
    const mdPath = join(testDir, 'passing.md')
    await writeFile(mdPath, `# Test

\`\`\`javascript
console.log("hello")
\`\`\`
`)

    const io = createMockIO()
    const result = await run({ targetPath: mdPath, concurrency: 1 }, io)

    expect(result.passed).toBe(1)
    expect(result.failed).toBe(0)
    expect(io.stdout).toContain('Results: 1/1 passed')
  })

  it('runs passing TypeScript code blocks', async () => {
    const mdPath = join(testDir, 'typescript.md')
    await writeFile(mdPath, `# TypeScript Test

\`\`\`typescript
const x: number = 42
console.log(x)
\`\`\`
`)

    const io = createMockIO()
    const result = await run({ targetPath: mdPath, concurrency: 1 }, io)

    expect(result.passed).toBe(1)
    expect(result.failed).toBe(0)
  })

  it('reports failing code blocks', async () => {
    const mdPath = join(testDir, 'failing.md')
    await writeFile(mdPath, `# Failing Test

\`\`\`javascript
throw new Error("oops")
\`\`\`
`)

    const io = createMockIO()
    const result = await run({ targetPath: mdPath, concurrency: 1 }, io)

    expect(result.passed).toBe(0)
    expect(result.failed).toBe(1)
    expect(io.stdout).toContain('Results: 0/1 passed')
  })

  it('scans directories for markdown files', async () => {
    await writeFile(join(testDir, 'a.md'), `\`\`\`js
console.log(1)
\`\`\``)
    await writeFile(join(testDir, 'b.md'), `\`\`\`js
console.log(2)
\`\`\``)

    const io = createMockIO()
    const result = await run({ targetPath: testDir, concurrency: 1 }, io)

    expect(result.passed).toBe(2)
    expect(result.failed).toBe(0)
    expect(io.stdout).toContain('Found 2 markdown file(s)')
  })

  it('ignores code blocks with nocheck marker', async () => {
    const mdPath = join(testDir, 'nocheck.md')
    await writeFile(mdPath, `# Test

\`\`\`javascript nocheck
// This should be ignored
throw new Error("not run")
\`\`\`

\`\`\`javascript
console.log("this runs")
\`\`\`
`)

    const io = createMockIO()
    const result = await run({ targetPath: mdPath, concurrency: 1 }, io)

    expect(result.passed).toBe(1)
    expect(result.failed).toBe(0)
  })

  it('runs multiple blocks in parallel when concurrency > 1', async () => {
    const mdPath = join(testDir, 'parallel.md')
    await writeFile(mdPath, `
\`\`\`js
console.log(1)
\`\`\`

\`\`\`js
console.log(2)
\`\`\`

\`\`\`js
console.log(3)
\`\`\`
`)

    const io = createMockIO()
    const result = await run({ targetPath: mdPath, concurrency: 3 }, io)

    expect(result.passed).toBe(3)
    expect(result.failed).toBe(0)
  })
})
