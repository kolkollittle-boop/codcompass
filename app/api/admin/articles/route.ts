import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let query = supabase
      .from('Article')
      .select('*, qualityDetails')
      .order('createdAt', { ascending: false })
      .limit(limit);
    
    // 如果指定了 status 参数，则过滤
    if (status) {
      query = query.eq('status', status);
    }
    // 不指定 status 时返回所有文章

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Admin Articles Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
