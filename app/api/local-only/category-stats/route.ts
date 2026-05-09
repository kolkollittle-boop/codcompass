/**
 * GET /api/local-only/category-stats
 * 查询各 KB 分类的已发布文章数量，供分类爬虫使用。
 * 需要 LOCAL_CRAWLER_UI_SECRET 验证（与其他 local-only API 一致）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertLocalCrawlerUiEnabled, authorizeLocalCrawlerApi } from '@/lib/local-crawler-ui-guard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekunyyscyqhasolbbohw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req: NextRequest) {
  try {
    assertLocalCrawlerUiEnabled();
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!authorizeLocalCrawlerApi(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 获取所有分类
    const { data: categories } = await supabase
      .from('Category')
      .select('id, slug, name, nameEn')
      .order('slug');

    if (!categories) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // 查询每个分类的文章数量
    // 使用 _ArticleToCategory 关联表查询（Prisma 多对多关系的隐式表）
    const categoryStats: Array<{
      slug: string;
      name: string;
      nameEn: string;
      publishedCount: number;
      totalWithStatus: number;
    }> = [];

    // 先获取所有已发布文章 ID 和有状态文章 ID
    const { data: publishedArticles } = await supabase
      .from('Article')
      .select('id')
      .eq('status', 'PUBLISHED');

    const { data: articlesWithStatus } = await supabase
      .from('Article')
      .select('id')
      .not('status', 'is', null);

    const publishedIds = new Set(publishedArticles?.map(a => a.id) || []);
    const statusIds = new Set(articlesWithStatus?.map(a => a.id) || []);

    // 获取所有关联记录
    const { data: allRelations } = await supabase
      .from('_ArticleToCategory')
      .select('A, B');

    // 按分类统计
    const relationsByCategory: Record<string, { published: number; withStatus: number }> = {};
    for (const rel of (allRelations || [])) {
      const catId = rel.B;
      if (!relationsByCategory[catId]) {
        relationsByCategory[catId] = { published: 0, withStatus: 0 };
      }
      if (publishedIds.has(rel.A)) {
        relationsByCategory[catId].published++;
      }
      if (statusIds.has(rel.A)) {
        relationsByCategory[catId].withStatus++;
      }
    }

    for (const cat of categories) {
      const stats = relationsByCategory[cat.id] || { published: 0, withStatus: 0 };
      categoryStats.push({
        slug: cat.slug,
        name: cat.name,
        nameEn: cat.nameEn,
        publishedCount: stats.published,
        totalWithStatus: stats.withStatus,
      });
    }

    // 查询未分类的已发布文章数量
    const categorizedArticleIds = new Set(allRelations?.map(r => r.A) || []);
    const uncategorizedCount = publishedArticles?.filter(a => !categorizedArticleIds.has(a.id)).length || 0;

    return NextResponse.json({
      success: true,
      categories: categoryStats,
      uncategorizedPublished: uncategorizedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
