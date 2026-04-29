import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Next.js 16 标准写法：params 必须是 Promise
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 必须 await 获取 params
    const { id } = await params;
    const body = await request.json();
    const { status, contentEn, titleEn, category, monetization, difficultyLevel } = body;

    const updates: any = {};
    if (contentEn) updates.contentEn = contentEn;
    if (titleEn) updates.titleEn = titleEn;
    if (category) updates.category = category;
    if (monetization) updates.monetization = monetization;
    if (difficultyLevel) updates.difficulty_level = difficultyLevel;

    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.reviewed_by = 'admin_user'; // 这里后续改为从 Session 获取
    } else {
      updates.status = status;
    }

    const { error } = await supabase.from('Article').update(updates).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
