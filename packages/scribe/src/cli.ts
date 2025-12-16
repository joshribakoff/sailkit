#!/usr/bin/env node
/**
 * Scribe CLI - test code fences from markdown files
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { cpus } from 'node:os'
import logUpdate from 'log-update'
import { parseMarkdown, filterTestableBlocks, type CodeBlock } from './parser.js'
import { runBlock, type RunResult } from './runner.js'

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

function parseArgs(): { targetDir: string; concurrency: number } {
  const args = process.argv.slice(2)
  let targetDir = process.cwd()
  let concurrency = cpus().length

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--runInBand' || arg === '-i') {
      concurrency = 1
    } else if (arg === '--parallel' || arg === '-j') {
      const next = args[i + 1]
      if (next && !next.startsWith('-')) {
        concurrency = parseInt(next, 10) || cpus().length
        i++
      }
    } else if (!arg.startsWith('-')) {
      targetDir = arg
    }
  }

  return { targetDir, concurrency }
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

async function main() {
  const { targetDir, concurrency } = parseArgs()

  console.log('Scanning for markdown files...')
  const mdFiles = await findMarkdownFiles(targetDir)
  console.log(`Found ${mdFiles.length} markdown file(s) (${concurrency} workers)\n`)

  // Collect all blocks
  const allBlocks: { block: CodeBlock; shortFile: string }[] = []

  for (const file of mdFiles) {
    const content = await readFile(file, 'utf-8')
    const blocks = filterTestableBlocks(parseMarkdown(content, file))
    const shortFile = file.replace(targetDir, '').replace(/^\//, '')

    for (const block of blocks) {
      allBlocks.push({ block, shortFile })
    }
  }

  if (allBlocks.length === 0) {
    console.log('No testable code blocks found.')
    return
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
      // Clear the running section, print result, then redraw running section
      logUpdate.clear()
    }

    if (success) {
      console.log(`\x1b[32m✓\x1b[0m ${label}`)
    } else {
      console.log(`\x1b[31m✗\x1b[0m ${label}`)
      if (error) {
        console.log(`  \x1b[90m${error}\x1b[0m`)
      }
    }

    if (useInteractiveOutput) {
      // Redraw running tests at bottom
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

      // Mark as running
      runningTests.set(index, { label, index })

      if (useInteractiveOutput) {
        logUpdate(renderRunningTests(Array.from(runningTests.values())))
      }

      const result = await runBlock(block)
      results[index] = result

      // Remove from running
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

  // Cleanup
  if (animationInterval) {
    clearInterval(animationInterval)
  }

  if (useInteractiveOutput) {
    logUpdate.clear()
  }

  console.log()
  const color = failed > 0 ? '\x1b[31m' : '\x1b[32m'
  console.log(`${color}Results: ${passed}/${allBlocks.length} passed\x1b[0m`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Scribe error:', err.message)
  process.exit(1)
})
