#!/usr/bin/env node
/**
 * IMPORTANT: THIS MODULE MUST BE READ-ONLY FILESYSTEM SAFE
 * No temp files, no disk writes - everything stays in memory.
 *
 * Scribe CLI - test code fences from markdown files
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { cpus } from 'node:os'
import { Command } from 'commander'
import logUpdate from 'log-update'
import { parseMarkdown, filterTestableBlocks, type CodeBlock } from './parser.js'
import { runBlock, type RunResult } from './runner.js'

// IO interface for testability
export interface IO {
  write(text: string): void
  writeError(text: string): void
}

// Real IO implementation
const realIO: IO = {
  write: (text) => process.stdout.write(text),
  writeError: (text) => process.stderr.write(text)
}

// Detect interactive TTY vs CI/piped output
const isTTY = process.stdout.isTTY ?? false
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
const useInteractiveOutput = isTTY && !isCI

// Spinner frames
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let spinnerIndex = 0

interface RunningTest {
  label: string
  index: number
}

export interface RunOptions {
  targetPath: string
  concurrency: number
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir)
    for (const entry of entries) {
      const fullPath = join(currentDir, entry)
      const info = await stat(fullPath)

      if (info.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        await walk(fullPath)
      } else if (info.isFile() && ['.md', '.mdx'].includes(extname(entry))) {
        files.push(fullPath)
      }
    }
  }

  await walk(dir)
  return files
}

function cleanErrorMessage(error: string): string {
  return error
    .replace(/file:\/\/[^\s]+\[eval\d*\]:\d+/g, '')
    .replace(/\[stdin\]:\d+/g, '')
    .split('\n')
    .filter(line => !line.includes('node:internal') && !line.includes('file://'))
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 1)
    .join('')
}

function renderRunningTests(running: RunningTest[]): string {
  if (running.length === 0) return ''

  const spinner = spinnerFrames[spinnerIndex % spinnerFrames.length]
  const lines = running.map(t => `  \x1b[33m${spinner}\x1b[0m ${t.label}`)
  return lines.join('\n')
}

export async function run(options: RunOptions, io: IO = realIO): Promise<{ passed: number; failed: number }> {
  const { targetPath, concurrency } = options

  // Determine if target is file or directory
  const targetStat = await stat(targetPath).catch(() => null)
  if (!targetStat) {
    io.writeError(`Error: Path not found: ${targetPath}\n`)
    return { passed: 0, failed: 1 }
  }

  let mdFiles: string[]
  let baseDir: string

  if (targetStat.isFile()) {
    mdFiles = [targetPath]
    baseDir = targetPath.includes('/') ? targetPath.substring(0, targetPath.lastIndexOf('/')) : '.'
  } else {
    io.write('Scanning for markdown files...\n')
    mdFiles = await findMarkdownFiles(targetPath)
    baseDir = targetPath
  }

  io.write(`Found ${mdFiles.length} markdown file(s) (${concurrency} workers)\n\n`)

  // Collect all blocks
  const allBlocks: { block: CodeBlock; shortFile: string }[] = []

  for (const file of mdFiles) {
    const content = await readFile(file, 'utf-8')
    const blocks = filterTestableBlocks(parseMarkdown(content, file))
    // Get relative path for display
    let shortFile = file
    if (baseDir !== '.' && file.startsWith(baseDir)) {
      shortFile = file.slice(baseDir.length).replace(/^\//, '')
    }

    for (const block of blocks) {
      allBlocks.push({ block, shortFile })
    }
  }

  if (allBlocks.length === 0) {
    io.write('No testable code blocks found.\n')
    return { passed: 0, failed: 0 }
  }

  // Track state
  const runningTests: Map<number, RunningTest> = new Map()
  let passed = 0
  let failed = 0

  // Spinner animation interval (only updates the bottom running section)
  let animationInterval: ReturnType<typeof setInterval> | undefined
  if (useInteractiveOutput) {
    animationInterval = setInterval(() => {
      spinnerIndex++
      const running = Array.from(runningTests.values())
      if (running.length > 0) {
        logUpdate(renderRunningTests(running))
      }
    }, 80)
  }

  // Helper to print a completed test (goes into scrollback)
  function printCompleted(label: string, success: boolean, error?: string) {
    if (useInteractiveOutput) {
      logUpdate.clear()
    }

    if (success) {
      io.write(`\x1b[32m✓\x1b[0m ${label}\n`)
    } else {
      io.write(`\x1b[31m✗\x1b[0m ${label}\n`)
      if (error) {
        io.write(`  \x1b[90m${error}\x1b[0m\n`)
      }
    }

    if (useInteractiveOutput) {
      const running = Array.from(runningTests.values())
      if (running.length > 0) {
        logUpdate(renderRunningTests(running))
      }
    }
  }

  // Run with concurrency
  const results: RunResult[] = new Array(allBlocks.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < allBlocks.length) {
      const index = nextIndex++
      const { shortFile, block } = allBlocks[index]
      const label = `${shortFile}:${block.line}`

      runningTests.set(index, { label, index })

      if (useInteractiveOutput) {
        logUpdate(renderRunningTests(Array.from(runningTests.values())))
      }

      const result = await runBlock(block)
      results[index] = result

      runningTests.delete(index)

      const cleanError = result.error ? cleanErrorMessage(result.error) : undefined

      if (result.success) {
        passed++
        printCompleted(label, true)
      } else {
        failed++
        printCompleted(label, false, cleanError)
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, allBlocks.length) },
    () => worker()
  )
  await Promise.all(workers)

  if (animationInterval) {
    clearInterval(animationInterval)
  }

  if (useInteractiveOutput) {
    logUpdate.clear()
  }

  io.write('\n')
  const color = failed > 0 ? '\x1b[31m' : '\x1b[32m'
  io.write(`${color}Results: ${passed}/${allBlocks.length} passed\x1b[0m\n`)

  return { passed, failed }
}

// CLI entry point
const program = new Command()
  .name('scribe')
  .description('Test code fences from markdown files')
  .argument('<path>', 'File or directory to test')
  .option('-i, --runInBand', 'Run tests sequentially (no parallelism)')
  .option('-j, --parallel <n>', 'Set number of parallel workers', String(cpus().length))

async function main() {
  program.parse()

  const targetPath = program.args[0]
  const opts = program.opts()

  let concurrency = parseInt(opts.parallel, 10) || cpus().length
  if (opts.runInBand) {
    concurrency = 1
  }

  const { failed } = await run({ targetPath, concurrency })

  if (failed > 0) {
    process.exit(1)
  }
}

// Only run when executed directly, not when imported for testing
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main().catch((err) => {
    console.error('Scribe error:', err.message)
    process.exit(1)
  })
}
