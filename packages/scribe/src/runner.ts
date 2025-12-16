/**
 * Simple runner - executes code blocks via stdin (no temp files)
 */

import { spawn } from 'node:child_process'
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
    const result = await executeCode(block.code, isTypeScript)

    return {
      block,
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.stderr || undefined
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

async function executeCode(code: string, isTypeScript: boolean): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    // Use tsx for TypeScript, node for JavaScript - both read from stdin
    const cmd = isTypeScript ? 'npx' : 'node'
    const args = isTypeScript ? ['tsx', '--input-type=module'] : ['--input-type=module']

    const proc = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr
      })
    })

    proc.on('error', (err) => {
      resolve({
        exitCode: 1,
        stdout,
        stderr: err.message
      })
    })

    // Write code to stdin and close
    proc.stdin.write(code)
    proc.stdin.end()
  })
}

export async function runBlocks(blocks: CodeBlock[]): Promise<RunResult[]> {
  const results: RunResult[] = []
  for (const block of blocks) {
    results.push(await runBlock(block))
  }
  return results
}
