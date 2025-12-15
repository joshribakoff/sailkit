import type { NavItem } from '@sailkit/compass';

// Navigation structure for the documentation
// Uses compass NavItem type - strings are leaf pages, objects with children are sections
export const navigation: NavItem[] = [
  'introduction',
  {
    slug: 'getting-started',
    children: [
      'installation',
      'quick-start',
    ],
  },
  {
    slug: 'packages',
    children: [
      'compass',
      'teleport',
      'lantern',
      'lighthouse',
      'atlas',
      'spyglass',
      'scribe',
    ],
  },
  {
    slug: 'guides',
    children: [
      'vim-navigation',
      'theming',
      'magic-links',
      'smart-404',
    ],
  },
  'architecture',
];

// Human-readable titles for each slug
export const titles: Record<string, string> = {
  'introduction': 'Introduction',
  'getting-started': 'Getting Started',
  'installation': 'Installation',
  'quick-start': 'Quick Start',
  'packages': 'Packages',
  'compass': 'Compass',
  'teleport': 'Teleport',
  'lantern': 'Lantern',
  'lighthouse': 'Lighthouse',
  'atlas': 'Atlas',
  'spyglass': 'Spyglass',
  'scribe': 'Scribe',
  'guides': 'Guides',
  'vim-navigation': 'Vim Navigation',
  'theming': 'Theming',
  'magic-links': 'Magic Links',
  'smart-404': 'Smart 404',
  'architecture': 'Architecture',
};

// Get title for a slug, with fallback
export function getTitle(slug: string): string {
  return titles[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
