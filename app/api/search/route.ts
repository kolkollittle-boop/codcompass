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

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // 搜索标题和摘要
    const { data, error } = await supabase
      .from('Article')
      .select(`
        id,
        slug,
        titleEn,
        excerptEn,
        isPublished
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
      })) || [],
    });
  } catch (error: any) {
    console.error('[Search Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
