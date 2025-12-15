/**
 * Represents a resolvable link target.
 */
export interface LinkTarget {
  /** Primary identifier for this target */
  id: string;
  /** URL slug (often same as id) */
  slug: string;
  /** Full URL path to this target */
  url: string;
  /** Alternative identifiers that also resolve to this target */
  aliases?: string[];
  /** Whether this is a placeholder/stub that hasn't been written yet */
  placeholder?: boolean;
}

/**
 * Result of attempting to resolve a magic link.
 */
export type ResolveResult =
  | { status: 'resolved'; target: LinkTarget; matchedId: string }
  | { status: 'placeholder'; target: LinkTarget; matchedId: string }
  | { status: 'unresolved'; id: string };

/**
 * Link syntax style.
 */
export type LinkSyntax = 'colon' | 'wiki' | 'both';

/**
 * Behavior when a link cannot be resolved.
 */
export type UnresolvedBehavior = 'text' | 'warn' | 'error';

/**
 * Configuration for the remark magic links plugin.
 */
export interface RemarkMagicLinksConfig {
  /** Available link targets */
  targets: LinkTarget[];
  /** Syntax style to parse (default: 'both') */
  syntax?: LinkSyntax;
  /** Behavior for unresolved links (default: 'text') */
  unresolvedBehavior?: UnresolvedBehavior;
  /** CSS class to add to placeholder links (default: 'placeholder-link') */
  placeholderClass?: string;
}

/**
 * A broken link found during checking.
 */
export interface BrokenLink {
  file: string;
  line: number;
  id: string;
}

/**
 * A placeholder link found during checking.
 */
export interface PlaceholderLink {
  file: string;
  line: number;
  id: string;
}

/**
 * Result of checking links in content files.
 */
export interface LinkCheckResult {
  broken: BrokenLink[];
  placeholders: PlaceholderLink[];
}

/**
 * Configuration for link checking.
 */
export interface LinkCheckConfig {
  /** Directory containing content files */
  contentDir: string;
  /** Available link targets */
  targets: LinkTarget[];
  /** File patterns to check (default: ['**\/*.md', '**\/*.mdx']) */
  patterns?: string[];
}

/**
 * Link resolver interface.
 */
export interface LinkResolver {
  /** Resolve a single ID to a target */
  resolve(id: string): ResolveResult;
  /** Resolve the first matching ID from a list of fallbacks */
  resolveFirst(ids: string[]): ResolveResult;
}
