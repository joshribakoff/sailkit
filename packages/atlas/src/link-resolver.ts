import type { LinkTarget, ResolveResult, LinkResolver } from './types.js';

/**
 * Create a link resolver from a list of targets.
 *
 * Resolution priority:
 * 1. Exact id match
 * 2. Match in aliases array
 * 3. Slug fallback
 * 4. Unresolved
 */
export function createLinkResolver(targets: LinkTarget[]): LinkResolver {
  // Build lookup maps for fast resolution
  const byId = new Map<string, LinkTarget>();
  const byAlias = new Map<string, LinkTarget>();
  const bySlug = new Map<string, LinkTarget>();

  for (const target of targets) {
    // Primary ID
    byId.set(target.id.toLowerCase(), target);

    // Aliases
    if (target.aliases) {
      for (const alias of target.aliases) {
        byAlias.set(alias.toLowerCase(), target);
      }
    }

    // Slug fallback
    bySlug.set(target.slug.toLowerCase(), target);
  }

  function resolve(id: string): ResolveResult {
    const normalizedId = id.toLowerCase();

    // 1. Exact ID match
    let target = byId.get(normalizedId);

    // 2. Alias match
    if (!target) {
      target = byAlias.get(normalizedId);
    }

    // 3. Slug fallback
    if (!target) {
      target = bySlug.get(normalizedId);
    }

    // 4. Unresolved
    if (!target) {
      return { status: 'unresolved', id };
    }

    // Return with placeholder status if applicable
    if (target.placeholder) {
      return { status: 'placeholder', target, matchedId: id };
    }

    return { status: 'resolved', target, matchedId: id };
  }

  function resolveFirst(ids: string[]): ResolveResult {
    for (const id of ids) {
      const result = resolve(id);
      if (result.status !== 'unresolved') {
        return result;
      }
    }
    // Return unresolved with the first ID for error reporting
    return { status: 'unresolved', id: ids[0] || '' };
  }

  return { resolve, resolveFirst };
}
