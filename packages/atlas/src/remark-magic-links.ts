import type { Root, Text, Link, Parent } from 'mdast';
import { visit } from 'unist-util-visit';
import { createLinkResolver } from './link-resolver.js';
import type { RemarkMagicLinksConfig, LinkSyntax } from './types.js';

/** Minimal plugin type compatible with unified */
type RemarkPlugin = (config: RemarkMagicLinksConfig) => (tree: Root) => void;

// Regex patterns for magic link syntax
// Colon syntax: [:id] or [:id1|:id2] for fallbacks - captures everything inside [:...]
const COLON_LINK_PATTERN = /\[:([^\]]+)\]/g;
// Wiki syntax: [[id]] or [[id|Display Text]]
const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

interface ParsedMagicLink {
  fullMatch: string;
  ids: string[];
  displayText?: string;
  /** The first ID that was searched for (for display purposes) */
  searchedId: string;
  startIndex: number;
}

/**
 * Parse colon syntax content into IDs and optional display text.
 * Handles: [:id], [:id1|:id2], [:id|Display Text]
 * IDs are prefixed with : while display text is not.
 */
function parseColonContent(content: string): { ids: string[]; displayText?: string } {
  const parts = content.split('|');
  const ids: string[] = [];
  let displayText: string | undefined;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(':')) {
      // This is an ID
      ids.push(trimmed.slice(1));
    } else if (ids.length > 0) {
      // First non-: prefixed part after IDs is display text
      displayText = trimmed;
      break;
    } else {
      // If no IDs yet and no :, treat as single ID without prefix
      ids.push(trimmed);
    }
  }

  return { ids, displayText };
}

/**
 * Parse magic links from text based on syntax configuration.
 */
function parseMagicLinks(text: string, syntax: LinkSyntax): ParsedMagicLink[] {
  const links: ParsedMagicLink[] = [];

  if (syntax === 'colon' || syntax === 'both') {
    let match: RegExpExecArray | null;
    COLON_LINK_PATTERN.lastIndex = 0;
    while ((match = COLON_LINK_PATTERN.exec(text)) !== null) {
      const { ids, displayText } = parseColonContent(match[1]);
      if (ids.length > 0) {
        links.push({
          fullMatch: match[0],
          ids,
          displayText,
          searchedId: ids[0],
          startIndex: match.index,
        });
      }
    }
  }

  if (syntax === 'wiki' || syntax === 'both') {
    let match: RegExpExecArray | null;
    WIKI_LINK_PATTERN.lastIndex = 0;
    while ((match = WIKI_LINK_PATTERN.exec(text)) !== null) {
      const id = match[1].trim();
      links.push({
        fullMatch: match[0],
        ids: [id],
        displayText: match[2]?.trim(),
        searchedId: id,
        startIndex: match.index,
      });
    }
  }

  // Sort by start index to process in order
  return links.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Remark plugin that transforms magic link syntax into actual links.
 *
 * Supports two syntax styles:
 * - Colon: `[:id]` or `[:id|:fallback]` or `[:id|Display Text]`
 * - Wiki: `[[id]]` or `[[id|Display Text]]`
 */
export const remarkMagicLinks: RemarkPlugin = (config) => {
  const { targets, syntax = 'both', unresolvedBehavior = 'text', placeholderClass = 'placeholder-link' } = config;

  const resolver = createLinkResolver(targets);

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;

      const magicLinks = parseMagicLinks(node.value, syntax);
      if (magicLinks.length === 0) return;

      // Build new nodes to replace this text node
      const newNodes: (Text | Link)[] = [];
      let lastIndex = 0;

      for (const magicLink of magicLinks) {
        // Add text before this magic link
        if (magicLink.startIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, magicLink.startIndex),
          });
        }

        // Resolve the magic link
        const result = resolver.resolveFirst(magicLink.ids);

        if (result.status === 'unresolved') {
          // Handle unresolved link based on behavior
          if (unresolvedBehavior === 'error') {
            throw new Error(`Unresolved magic link: ${magicLink.ids.join(' | ')}`);
          }
          if (unresolvedBehavior === 'warn') {
            console.warn(`Warning: Unresolved magic link: ${magicLink.ids.join(' | ')}`);
          }
          // Convert to plain text (graceful degradation)
          const displayText = magicLink.displayText || magicLink.ids[0];
          newNodes.push({
            type: 'text',
            value: displayText,
          });
        } else {
          // Create actual link
          const { target, matchedId } = result;
          // Use explicit display text, or the ID that was actually matched
          const displayText = magicLink.displayText || matchedId;

          const linkNode: Link = {
            type: 'link',
            url: target.url,
            children: [{ type: 'text', value: displayText }],
          };

          // Add placeholder class via data attribute if applicable
          if (result.status === 'placeholder') {
            linkNode.data = {
              hProperties: { class: placeholderClass },
            };
          }

          newNodes.push(linkNode);
        }

        lastIndex = magicLink.startIndex + magicLink.fullMatch.length;
      }

      // Add remaining text after last magic link
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      // Replace the original text node with new nodes
      (parent.children as (Text | Link)[]).splice(index, 1, ...newNodes);
    });
  };
};

export default remarkMagicLinks;
