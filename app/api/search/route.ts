import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type'); // 'search' | 'recommend'
    const articleId = searchParams.get('articleId'); // 用于推荐

    // 推荐接口 - 基于标签和专题
    if (type === 'recommend' && articleId) {
      return await getRecommendations(articleId);
    }

    // 搜索接口
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // 搜索标题、摘要和标签
    const { data, error } = await supabase
      .from('Article')
      .select(`
        id,
        slug,
        titleEn,
        excerptEn,
        isPublished,
        difficultyLevel,
        seriesId,
        seriesOrder,
        series:ArticleSeries(slug, title, titleEn),
        categories:_ArticleToCategory!_ArticleToCategory_A_fkey(Category(slug, name)),
        tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(slug, name))
      `)
      .or(`titleEn.ilike.%${q}%,excerptEn.ilike.%${q}%`)
      .eq('isPublished', true)
      .limit(10);

    if (error) {
      console.error('[Search Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      results: data?.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        titleEn: a.titleEn,
        excerptEn: a.excerptEn,
        difficultyLevel: a.difficultyLevel,
        series: a.series ? {
          slug: a.series.slug,
          title: a.series.titleEn,
        } : null,
        categories: a.categories?.map((c: any) => c.Category?.[0]).filter(Boolean) || [],
        tags: a.tags?.map((t: any) => t.Tag?.[0]).filter(Boolean) || [],
      })) || [],
    });
  } catch (error: any) {
    console.error('[Search Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 获取推荐文章 - 基于相同专题或标签
async function getRecommendations(articleId: string) {
  try {
    // 获取当前文章的专题和标签
    const { data: currentArticle } = await supabase
      .from('Article')
      .select(`
        id,
        seriesId,
        tags:_ArticleToTag!_ArticleToTag_A_fkey(Tag(id))
      `)
      .eq('id', articleId)
      .single();

    if (!currentArticle) {
      return NextResponse.json({ results: [] });
    }

    // 获取相同专题的其他文章
    let query = supabase
      .from('Article')
      .select(`
        id,
        slug,
        titleEn,
        excerptEn,
        isPublished,
        difficultyLevel,
        series:ArticleSeries(slug, title, titleEn)
      `)
      .eq('isPublished', true)
      .neq('id', articleId)
      .limit(5);

    // 优先推荐相同专题的文章
    if (currentArticle.seriesId) {
      query = query.eq('seriesId', currentArticle.seriesId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Recommendations Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      results: data?.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        titleEn: a.titleEn,
        excerptEn: a.excerptEn,
        difficultyLevel: a.difficultyLevel,
        series: a.series ? {
          slug: a.series.slug,
          title: a.series.titleEn,
        } : null,
      })) || [],
    });
  } catch (error: any) {
    console.error('[Recommendations Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
