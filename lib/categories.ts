import type { CategoryInfo } from '@/lib/category-types';
import { CC20_SECTIONS } from '@/lib/cc20-kb-taxonomy';

export type { CategoryInfo } from '@/lib/category-types';

/** Codcompass 2.0 KB sections (browse / filter); synced with lib/kb-nav-tree pillars. */
export const CATEGORIES: CategoryInfo[] = CC20_SECTIONS;

export const categoryBySlug = (slug: string): CategoryInfo | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const allCategorySlugs = CATEGORIES.map((c) => c.slug);
