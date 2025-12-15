import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { createLinkResolver } from './link-resolver.js';
import type { LinkCheckConfig, LinkCheckResult, BrokenLink, PlaceholderLink } from './types.js';

// Regex to find magic links in content (both syntaxes)
const MAGIC_LINK_PATTERN = /\[:([^\]|]+)(?:\|[^\]]+)?\]|\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

/**
 * Find all files matching patterns in a directory recursively.
 */
function findFiles(dir: string, patterns: string[]): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    if (!existsSync(currentDir)) return;

    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip common non-content directories
        if (!['node_modules', '.git', 'dist', '.astro'].includes(entry)) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        // Simple pattern matching: check if extension matches any pattern
        const matchesPattern = patterns.some((pattern) => {
          if (pattern.includes('*')) {
            const extPattern = pattern.replace('**/', '').replace('*', '');
            return ext === extPattern;
          }
          return fullPath.endsWith(pattern);
        });
        if (matchesPattern) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Extract magic links from a file with line numbers.
 */
function extractLinksFromFile(filePath: string): Array<{ id: string; line: number }> {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const links: Array<{ id: string; line: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    MAGIC_LINK_PATTERN.lastIndex = 0;

    while ((match = MAGIC_LINK_PATTERN.exec(line)) !== null) {
      // First capture group is colon syntax, second is wiki syntax
      const id = (match[1] || match[2]).split('|')[0].replace(/^:/, '').trim();
      links.push({ id, line: i + 1 }); // 1-indexed line numbers
    }
  }

  return links;
}

/**
 * Check all magic links in content files for broken or placeholder links.
 */
export function checkLinks(config: LinkCheckConfig): LinkCheckResult {
  const { contentDir, targets, patterns = ['**/*.md', '**/*.mdx'] } = config;

  const resolver = createLinkResolver(targets);
  const broken: BrokenLink[] = [];
  const placeholders: PlaceholderLink[] = [];

  const files = findFiles(contentDir, patterns);

  for (const file of files) {
    const links = extractLinksFromFile(file);

    for (const { id, line } of links) {
      const result = resolver.resolve(id);

      if (result.status === 'unresolved') {
        broken.push({ file, line, id });
      } else if (result.status === 'placeholder') {
        placeholders.push({ file, line, id });
      }
    }
  }

  return { broken, placeholders };
}
