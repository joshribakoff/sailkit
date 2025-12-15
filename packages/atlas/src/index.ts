// Types
export type {
  LinkTarget,
  ResolveResult,
  LinkSyntax,
  UnresolvedBehavior,
  RemarkMagicLinksConfig,
  BrokenLink,
  PlaceholderLink,
  LinkCheckResult,
  LinkCheckConfig,
  LinkResolver,
} from './types.js';

// Link resolver
export { createLinkResolver } from './link-resolver.js';

// Remark plugin
export { remarkMagicLinks, default as remarkMagicLinksDefault } from './remark-magic-links.js';

// Link checker
export { checkLinks } from './link-checker.js';
