/**
 * Generates markdown with N levels of nesting around code content.
 * Alternates between list items and blockquotes for variety.
 */
export function nestCode(levels: number, useInlineCode: boolean): string {
  const codeContent = useInlineCode
    ? '`[[not-a-link]]`'
    : '```\n[[not-a-link]]\n```';

  let result = codeContent;
  for (let i = 0; i < levels; i++) {
    if (i % 2 === 0) {
      result = `- ${result.split('\n').join('\n  ')}`; // list
    } else {
      result = result.split('\n').map(line => `> ${line}`).join('\n'); // blockquote
    }
  }
  return result;
}
