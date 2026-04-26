import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, ""); // Remove potential quotes
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, ""); // Remove potential quotes
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (admin) - only use in server components/API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Article = {
  id: string;
  slug: string;
  titleEn: string;
  contentEn: string;
  descriptionEn: string | null;
  excerptEn: string | null;
  isPremium: boolean;
  isPublished: boolean;
  sourceSite: string | null;
  sourceAuthor: string | null;
  publishedAt: string | null;
  viewCount: number;
  likeCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  categories: { Category: { name: string; slug: string }[] }[];
  tags: { Tag: { name: string; slug: string }[] }[];
  translations?: Array<{
    locale: string;
    title: string;
    content: string;
    excerpt: string | null;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
};

export async function getArticleBySlug(slug: string, locale?: string): Promise<Article | null> {
  let query = supabaseAdmin
    .from('Article')
    .select(`
      id,
      slug,
      titleEn,
      contentEn,
      descriptionEn,
      excerptEn,
      isPremium,
      isPublished,
      sourceSite,
      sourceAuthor,
      publishedAt,
      viewCount,
      likeCount,
      seoTitle,
      seoDescription,
      categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
      tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name)),
      translations:ArticleTranslation(locale, title, content, excerpt, description, seoTitle, seoDescription)
    `)
    .eq('slug', slug)
    .eq('isPublished', true);

  if (locale) {
    query = query.select(`
      id,
      slug,
      titleEn,
      contentEn,
      descriptionEn,
      excerptEn,
      isPremium,
      isPublished,
      sourceSite,
      sourceAuthor,
      publishedAt,
      viewCount,
      likeCount,
      seoTitle,
      seoDescription,
      categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
      tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name)),
      translations:ArticleTranslation!ArticleTranslation_articleId_fkey(locale, title, content, excerpt, description, seoTitle, seoDescription)
    `);
  }

  const { data, error } = await query.single();

  if (error || !data) return null;
  return data as Article;
}

export async function getPublishedArticles(limit = 20, offset = 0, locale?: string) {
  // Use supabaseAdmin to bypass RLS for public article listing
  let query = supabaseAdmin
    .from('Article')
    .select(`
      id,
      slug,
      titleEn,
      excerptEn,
      isPremium,
      isPublished,
      sourceSite,
      publishedAt,
      viewCount,
      categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
      tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name)),
      translations:ArticleTranslation(locale, title, excerpt)
    `)
    .eq('isPublished', true)
    .order('publishedAt', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('[getPublishedArticles] Error:', error);
    return [];
  }
  return data;
}

export async function incrementViewCount(articleId: string) {
  await supabase.rpc('increment_view_count', { article_id: articleId });
}
