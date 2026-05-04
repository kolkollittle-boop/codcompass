/**
 * Blog listing/detail queries (`BlogPost` / `BlogCategory`).
 * Experience-style posts live here; canonical knowledge lives in KB `Article` / `Category` + Supabase helpers.
 *
 * Handles Prisma `P2021` (table missing) so `next build` succeeds before `prisma migrate deploy` on CI.
 */
import { prisma } from '@/lib/db';

function isMissingBlogTable(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2021';
}

export type BlogPostCardDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  /** ISO string for safe client serialization */
  publishedAt: string | null;
  readingMinutes: number;
  tags: string[];
  categoryName: string;
  categorySlug: string;
};

export type BlogCategoryDTO = {
  slug: string;
  name: string;
};

export async function getBlogCategoriesForNav(): Promise<BlogCategoryDTO[]> {
  try {
    const rows = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true },
    });
    return rows;
  } catch (e) {
    if (isMissingBlogTable(e)) return [];
    throw e;
  }
}

export async function getPublishedBlogPostCards(): Promise<BlogPostCardDTO[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        readingMinutes: true,
        tags: true,
        category: { select: { slug: true, name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      author: r.author,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      readingMinutes: r.readingMinutes,
      tags: r.tags,
      categoryName: r.category.name,
      categorySlug: r.category.slug,
    }));
  } catch (e) {
    if (isMissingBlogTable(e)) return [];
    throw e;
  }
}

export async function getPublishedBlogPostBySlug(slug: string) {
  try {
    return await prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        contentHtml: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        readingMinutes: true,
        seoTitle: true,
        seoDescription: true,
        tags: true,
        category: { select: { slug: true, name: true } },
      },
    });
  } catch (e) {
    if (isMissingBlogTable(e)) return null;
    throw e;
  }
}
