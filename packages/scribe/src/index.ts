/**
 * @sailkit/scribe
 * Extract and test code fences from markdown documentation
 */

export { parseMarkdown, filterTestableBlocks } from './parser.js'
export type { CodeBlock } from './parser.js'

export { runBlock, runBlocks } from './runner.js'
export type { RunResult } from './runner.js'
