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
  accessLevel: 'free' | 'builder' | 'pro';  // 新增：访问级别
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
  // Codcompass 2.0 新增字段
  difficultyLevel: string | null;   // L1, L2, L3, L4
  readingTime: number | null;       // 预计阅读时间（分钟）
  expectedOutcome: string | null;   // 预期收益短句
  seriesId: string | null;          // 所属专题 ID
  seriesOrder: number | null;       // 专题中的顺序
  blueprintUrl: string | null;      // Production Blueprint 下载链接
  blueprintName: string | null;     // Blueprint 文件名
  series?: ArticleSeries | null;    // 专题信息
};

export type ArticleSeries = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string | null;
  totalParts: number;
  estimatedTime: number | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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
      difficultyLevel,
      readingTime,
      expectedOutcome,
      seriesId,
      seriesOrder,
      blueprintUrl,
      blueprintName,
      categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
      tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name)),
      translations:ArticleTranslation(locale, title, content, excerpt, description, seoTitle, seoDescription),
      series:ArticleSeries(id, slug, title, titleEn, description, totalParts, estimatedTime, order, isPublished)
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
      difficultyLevel,
      readingTime,
      expectedOutcome,
      seriesId,
      seriesOrder,
      blueprintUrl,
      blueprintName,
      categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
      tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name)),
      translations:ArticleTranslation!ArticleTranslation_articleId_fkey(locale, title, content, excerpt, description, seoTitle, seoDescription),
      series:ArticleSeries(id, slug, title, titleEn, description, totalParts, estimatedTime, order, isPublished)
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

  // Step 1: Get the category ID by slug
  const { data: category } = await supabaseAdmin
    .from('Category')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!category) {
    return [];
  }

  // Step 2: Get articles in this category via the join table
  const { data: joinRows, error: joinError } = await supabaseAdmin
    .from('_ArticleToCategory')
    .select('A') // A = Article.id
    .eq('B', category.id); // B = Category.id

  if (joinError || !joinRows || joinRows.length === 0) {
    if (joinError) console.error('[getArticlesByCategorySlug] Join query error:', joinError);
    return [];
  }

  const articleIds = joinRows.map((row: any) => row.A);

  // Step 3: Fetch article details
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
      categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
      tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name)),
      translations:ArticleTranslation(locale, title, excerpt)
    `)
    .eq('isPublished', true)
    .in('id', articleIds)
    .order('publishedAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getArticlesByCategorySlug] Error:', error);
    return [];
  }
  return data;
}

export async function incrementViewCount(articleId: string) {
  await supabase.rpc('increment_view_count', { article_id: articleId });
}

export async function getCategories() {
  if (!supabaseAdmin) {
    console.error('[getCategories] supabaseAdmin is undefined');
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('Category')
    .select('id, slug, name')
    .order('name');

  if (error) {
    console.error('[getCategories] Error:', error);
    return [];
  }
  return data;
}

/** Get published article count, optionally filtered by category slug. */
export async function getArticleCount(categorySlug?: string): Promise<number> {
  if (!supabaseAdmin) return 0;

  if (!categorySlug) {
    const { count, error } = await supabaseAdmin
      .from('Article')
      .select('*', { count: 'exact', head: true })
      .eq('isPublished', true);
    if (error) { console.error('[getArticleCount] Error:', error); return 0; }
    return count ?? 0;
  }

  // Count via join table
  const { data: category } = await supabaseAdmin
    .from('Category')
    .select('id')
    .eq('slug', categorySlug)
    .single();
  if (!category) return 0;

  const { count, error } = await supabaseAdmin
    .from('_ArticleToCategory')
    .select('A', { count: 'exact', head: true })
    .eq('B', category.id);
  if (error) { console.error('[getArticleCount] Join error:', error); return 0; }
  return count ?? 0;
}

/** Get counts per category slug. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  if (!supabaseAdmin) return {};

  const { data: categories } = await supabaseAdmin
    .from('Category')
    .select('id, slug');
  if (!categories) return {};

  const counts: Record<string, number> = {};
  await Promise.all(
    categories.map(async (cat: any) => {
      const { count } = await supabaseAdmin
        .from('_ArticleToCategory')
        .select('A', { count: 'exact', head: true })
        .eq('B', cat.id);
      counts[cat.slug] = count ?? 0;
    })
  );
  return counts;
}

/** Get premium article count. */
export async function getPremiumCount(): Promise<number> {
  if (!supabaseAdmin) return 0;
  const { count, error } = await supabaseAdmin
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .eq('isPublished', true)
    .eq('isPremium', true);
  if (error) { console.error('[getPremiumCount] Error:', error); return 0; }
  return count ?? 0;
}

// Codcompass 2.0 新增：获取专题文章列表
export async function getSeriesArticles(seriesSlug: string, locale?: string): Promise<{ series: any | null; articles: any[] }> {
  if (!supabaseAdmin) return { series: null, articles: [] };

  // 先获取专题信息
  const { data: seriesData } = await supabaseAdmin
    .from('ArticleSeries')
    .select('*')
    .eq('slug', seriesSlug)
    .single();

  if (!seriesData) return { series: null, articles: [] };

  // 获取该专题下的所有文章
  const { data: articles, error } = await supabaseAdmin
    .from('Article')
    .select(`
      id,
      slug,
      titleEn,
      excerptEn,
      isPremium,
      isPublished,
      seriesOrder,
      difficultyLevel,
      readingTime,
      publishedAt,
      translations:ArticleTranslation(locale, title, excerpt)
    `)
    .eq('seriesId', seriesData.id)
    .eq('isPublished', true)
    .order('seriesOrder', { ascending: true });

  if (error) {
    console.error('[getSeriesArticles] Error:', error);
    return { series: seriesData, articles: [] };
  }

  return { series: seriesData, articles: articles || [] };
}
