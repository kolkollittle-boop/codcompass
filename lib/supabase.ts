import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Clean env vars (remove quotes/whitespace from Vercel UI)
const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, "");
const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, "");

// Validate critical env vars before initializing
if (!supabaseUrl) {
  throw new Error('Missing or empty NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing or empty NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (admin) - only use in server components/API routes
// Guarded to prevent crashing in client components where SUPABASE_SERVICE_ROLE_KEY is undefined
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : undefined as any;

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
  // Guard against undefined supabaseAdmin (e.g., in client-side contexts)
  if (!supabaseAdmin) {
    console.error('[getPublishedArticles] supabaseAdmin is undefined');
    return [];
  }

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

export async function getArticlesByCategorySlug(slug: string, limit = 20, offset = 0) {
  if (!supabaseAdmin) {
    console.error('[getArticlesByCategorySlug] supabaseAdmin is undefined');
    return [];
  }

  // Use supabaseAdmin to bypass RLS
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
    .eq('Category.slug', slug) // Filter by category
    .order('publishedAt', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('[getArticlesByCategorySlug] Error:', error);
    return [];
  }
  return data;
}

export async function incrementViewCount(articleId: string) {
  await supabase.rpc('increment_view_count', { article_id: articleId });
}
