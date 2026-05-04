/**
 * 方案 2.4：同步前校验路由结果是否在 taxonomy.json 合法集合内。
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { SemanticRouteResult } from './semantic-router';

export function validateRouteAgainstTaxonomy(route: SemanticRouteResult): {
  ok: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const root = dirname(fileURLToPath(import.meta.url));
  const path = join(root, '..', 'taxonomy.json');
  const { kb_section_slugs = [], blog_category_slugs = [] } = JSON.parse(
    readFileSync(path, 'utf-8')
  ) as {
    kb_section_slugs: string[];
    blog_category_slugs: string[];
  };

  if (route.type === 'KB') {
    const slug = route.kb_section_slug;
    if (slug && !kb_section_slugs.includes(slug)) {
      warnings.push(`KB slug 不在 taxonomy: ${slug}`);
    }
  } else {
    const slug = route.blog_category_slug;
    if (slug && !blog_category_slugs.includes(slug)) {
      warnings.push(`Blog 分类不在 taxonomy: ${slug}`);
    }
  }

  return { ok: warnings.length === 0, warnings };
}
