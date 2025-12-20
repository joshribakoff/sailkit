import type { Root, Text, Link, Parent } from 'mdast';
import { visit } from 'unist-util-visit';

export type LinkSyntax = 'colon' | 'wiki' | 'both';

export interface RemarkMagicLinksConfig {
  /** Build URL from link ID */
  urlBuilder: (id: string) => string;
  /** Syntax style to parse (default: 'wiki') */
  syntax?: LinkSyntax;
}

/** Minimal plugin type compatible with unified */
type RemarkPlugin = (config: RemarkMagicLinksConfig) => (tree: Root) => void;

// Regex patterns for magic link syntax
// Colon syntax: [:id] or [:id|Display Text]
const COLON_LINK_PATTERN = /\[:([^\]|]+)(?:\|([^\]]+))?\]/g;
// Wiki syntax: [[id]] or [[id|Display Text]]
const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

interface ParsedLink {
  fullMatch: string;
  id: string;
  displayText?: string;
  startIndex: number;
}

function parseMagicLinks(text: string, syntax: LinkSyntax): ParsedLink[] {
  const links: ParsedLink[] = [];

  if (syntax === 'colon' || syntax === 'both') {
    let match: RegExpExecArray | null;
    COLON_LINK_PATTERN.lastIndex = 0;
    while ((match = COLON_LINK_PATTERN.exec(text)) !== null) {
      links.push({
        fullMatch: match[0],
        id: match[1].trim(),
        displayText: match[2]?.trim(),
        startIndex: match.index,
      });
    }
  }

  if (syntax === 'wiki' || syntax === 'both') {
    let match: RegExpExecArray | null;
    WIKI_LINK_PATTERN.lastIndex = 0;
    while ((match = WIKI_LINK_PATTERN.exec(text)) !== null) {
      links.push({
        fullMatch: match[0],
        id: match[1].trim(),
        displayText: match[2]?.trim(),
        startIndex: match.index,
      });
    }
  }

  return links.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Remark plugin that transforms magic link syntax into actual links.
 *
 * Supports two syntax styles:
 * - Colon: `[:id]` or `[:id|Display Text]`
 * - Wiki: `[[id]]` or `[[id|Display Text]]`
 */
export const remarkMagicLinks: RemarkPlugin = (config) => {
  const { urlBuilder, syntax = 'wiki' } = config;

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;

      const magicLinks = parseMagicLinks(node.value, syntax);
      if (magicLinks.length === 0) return;

      const newNodes: (Text | Link)[] = [];
      let lastIndex = 0;

      for (const link of magicLinks) {
        // Text before this link
        if (link.startIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, link.startIndex),
          });
        }

        // Create link node
        const displayText = link.displayText || link.id;
        const url = urlBuilder(link.id);

        newNodes.push({
          type: 'link',
          url,
          children: [{ type: 'text', value: displayText }],
        });

        lastIndex = link.startIndex + link.fullMatch.length;
      }

      // Remaining text after last link
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      (parent.children as (Text | Link)[]).splice(index, 1, ...newNodes);
    });
  };
};

export default remarkMagicLinks;
