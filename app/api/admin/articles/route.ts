import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // 获取待审核的文章 (status = 'scored')
    const { data, error } = await supabase
      .from('Article')
      .select('*')
      .eq('status', 'scored')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Admin Articles Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
