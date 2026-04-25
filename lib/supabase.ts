import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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
};

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
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
      categories:ArticleToCategory(Category(slug, name)),
      tags:ArticleToTag(Tag(slug, name))
    `)
    .eq('slug', slug)
    .eq('isPublished', true)
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function getPublishedArticles(limit = 20, offset = 0) {
  // Use supabaseAdmin to bypass RLS for public article listing
  const { data, error } = await supabaseAdmin
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
      categories:_ArticleToCategory!inner(Category(slug, name)),
      tags:_ArticleToTag!inner(Tag(slug, name))
    `)
    .eq('isPublished', true)
    .order('publishedAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getPublishedArticles] Error:', error);
    return [];
  }
  return data;
}

export async function incrementViewCount(articleId: string) {
  await supabase.rpc('increment_view_count', { article_id: articleId });
}
