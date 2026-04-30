import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  // 获取已发布的专题列表
  const { data: series, error } = await supabaseAdmin
    .from('ArticleSeries')
    .select('*')
    .eq('isPublished', true)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[GET /api/series] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }

  // 获取每个专题的文章数量
  const seriesWithCount = await Promise.all(
    (series || []).map(async (s: any) => {
      const { count } = await supabaseAdmin
        .from('Article')
        .select('*', { count: 'exact', head: true })
        .eq('seriesId', s.id)
        .eq('isPublished', true);
      
      return { ...s, articleCount: count ?? 0 };
    })
  );

  return NextResponse.json({ series: seriesWithCount });
}
