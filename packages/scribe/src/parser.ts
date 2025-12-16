/**
 * Code fence parser - extracts fenced code blocks from markdown
 */

export interface CodeBlock {
  language: string
  code: string
  file: string
  line: number
}

const CODE_FENCE_REGEX = /^```(\w*)\n([\s\S]*?)^```/gm

export function parseMarkdown(content: string, filePath: string): CodeBlock[] {
  const blocks: CodeBlock[] = []
  let match: RegExpExecArray | null

  while ((match = CODE_FENCE_REGEX.exec(content)) !== null) {
    const language = match[1] || 'text'
    const code = match[2]

    // Calculate line number
    const beforeMatch = content.slice(0, match.index)
    const line = beforeMatch.split('\n').length

    blocks.push({
      language,
      code,
      file: filePath,
      line
    })
  }

  return blocks
}

export function filterTestableBlocks(blocks: CodeBlock[]): CodeBlock[] {
  const testableLanguages = ['typescript', 'ts', 'javascript', 'js']
  return blocks.filter(block => testableLanguages.includes(block.language.toLowerCase()))
}
