/**
 * IMPORTANT: THIS MODULE MUST BE READ-ONLY FILESYSTEM SAFE
 * No temp files, no disk writes - everything stays in memory.
 *
 * In-process runner using esbuild build + vm module
 * Bundles imports so code blocks can use real packages
 */

import vm from 'node:vm'
import assert from 'node:assert'
import { build } from 'esbuild'
import { dirname } from 'node:path'
import type { CodeBlock } from './parser.js'

export interface RunResult {
  block: CodeBlock
  success: boolean
  output: string
  error?: string
}

export async function runBlock(block: CodeBlock): Promise<RunResult> {
  const isTypeScript = block.language === 'typescript' || block.language === 'ts'

  try {
    // Bundle with esbuild using stdin - no temp files
    const result = await build({
      stdin: {
        contents: block.code,
        loader: isTypeScript ? 'ts' : 'js',
        resolveDir: dirname(block.file), // resolve imports relative to markdown file
      },
      bundle: true,
      write: false,
      format: 'cjs',
      platform: 'node',
      target: 'node18',
    })

    const code = result.outputFiles[0].text

    // Capture console output
    let stdout = ''
    const mockConsole = {
      log: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      error: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      warn: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      info: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' }
    }

    // Create sandbox with common globals
    // assert is provided globally so code blocks can use it without imports
    const sandbox = {
      console: mockConsole,
      assert,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      process: { env: process.env },
      Error,
      TypeError,
      ReferenceError,
      SyntaxError
    }

    vm.createContext(sandbox)

    // Execute with timeout
    const script = new vm.Script(code, { filename: 'code-block.js' })
    script.runInContext(sandbox, { timeout: 5000 })

    return {
      block,
      success: true,
      output: stdout
    }
  } catch (err) {
    return {
      block,
      success: false,
      output: '',
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export async function runBlocks(blocks: CodeBlock[]): Promise<RunResult[]> {
  const results: RunResult[] = []
  for (const block of blocks) {
    results.push(await runBlock(block))
  }
  return results
}
