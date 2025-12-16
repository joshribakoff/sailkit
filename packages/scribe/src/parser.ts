/**
 * IMPORTANT: THIS MODULE MUST BE READ-ONLY FILESYSTEM SAFE
 * No temp files, no disk writes - everything stays in memory.
 *
 * Code fence parser - extracts fenced code blocks from markdown
 */

export interface CodeBlock {
  language: string
  code: string
  file: string
  line: number
  meta?: string
}

// Matches code fences with optional info string (e.g., ```javascript scribe)
// Captures: 1=language, 2=rest of info line (may contain "scribe" marker), 3=code
const CODE_FENCE_REGEX = /^```(\w*)([^\n]*)\n([\s\S]*?)^```/gm

export function parseMarkdown(content: string, filePath: string): CodeBlock[] {
  const blocks: CodeBlock[] = []
  let match: RegExpExecArray | null

  while ((match = CODE_FENCE_REGEX.exec(content)) !== null) {
    const language = match[1] || 'text'
    const infoString = match[2]?.trim() || ''
    const code = match[3]

    // Calculate line number
    const beforeMatch = content.slice(0, match.index)
    const line = beforeMatch.split('\n').length

    blocks.push({
      language,
      code,
      file: filePath,
      line,
      meta: infoString
    })
  }

  return blocks
}

export function filterTestableBlocks(blocks: CodeBlock[]): CodeBlock[] {
  const testableLanguages = ['typescript', 'ts', 'javascript', 'js']
  return blocks.filter(block =>
    testableLanguages.includes(block.language.toLowerCase()) &&
    !block.meta?.includes('nocheck') // opt-out with ```ts nocheck
  )
}
