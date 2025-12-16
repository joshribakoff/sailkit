/**
 * IMPORTANT: THIS PACKAGE MUST BE READ-ONLY FILESYSTEM SAFE
 * No temp files, no disk writes - everything stays in memory.
 *
 * @sailkit/scribe
 * Test code fences from markdown documentation
 */

export { parseMarkdown, filterTestableBlocks } from './parser.js'
export type { CodeBlock } from './parser.js'

export { runBlock, runBlocks } from './runner.js'
export type { RunResult } from './runner.js'
