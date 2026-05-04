import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 方案 4.2：支持 `{ article: { ... }, secret }` 嵌套结构；`kbPath`（vault 路径）映射到 cc20 slug。
 */
export function kbVaultPathToCc20Slug(kbPath: string): string | null {
  const target = kbPath.trim().replace(/\/+$/, '');
  if (!target) return null;

  const taxonomyPath = join(process.cwd(), 'automation/crawler/taxonomy.json');
  if (!existsSync(taxonomyPath)) return null;

  try {
    const raw = JSON.parse(readFileSync(taxonomyPath, 'utf-8')) as { kb_vault_hints?: string[] };
    const hints = raw.kb_vault_hints || [];
    for (const line of hints) {
      const parts = line.split('→');
      if (parts.length !== 2) continue;
      const prefix = parts[0].trim();
      const slug = parts[1].trim();
      if (target === prefix || target.startsWith(`${prefix}/`)) return slug;
    }
  } catch {
    return null;
  }
  return null;
}

export function normalizeIngestPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const top = { ...raw };

  if (raw.article && typeof raw.article === 'object') {
    const a = raw.article as Record<string, unknown>;
    const meta =
      a.metadata && typeof a.metadata === 'object' ? (a.metadata as Record<string, unknown>) : {};

    const kbFromPath =
      typeof a.kbPath === 'string'
        ? kbVaultPathToCc20Slug(a.kbPath)
        : typeof a.kb_path === 'string'
          ? kbVaultPathToCc20Slug(a.kb_path)
          : null;

    Object.assign(top, a, {
      title: a.title ?? top.title,
      content: a.content ?? top.content,
      sourceUrl: a.sourceUrl ?? a.source_url ?? top.sourceUrl,
      articleType: (a.type as string) ?? a.articleType ?? top.articleType,
      kbSectionSlug:
        a.kbSectionSlug ??
        a.kb_section_slug ??
        kbFromPath ??
        top.kbSectionSlug ??
        top.kb_section_slug,
      blogCategorySlug:
        a.blogCategory ?? a.blog_category ?? a.blogCategorySlug ?? top.blogCategorySlug,
      score: meta.score ?? a.score ?? top.score,
      aiScore: meta.score ?? a.score ?? top.aiScore,
      simhash: a.simhash ?? top.simhash,
      images: meta.images ?? a.images ?? top.images,
      mentorSummary: a.mentorSummary ?? a.mentor_summary ?? top.mentorSummary,
      sourceAuthor: meta.author ?? a.author ?? top.sourceAuthor,
      faq: a.faq ?? meta.faq ?? top.faq,
    });
  }

  delete top.secret;
  delete top.article;

  return top;
}
