import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Next.js 15 修复：params 现在是 Promise 类型
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ 必须 await
    const body = await req.json();
    const { status, contentEn, titleEn, category, monetization, difficultyLevel, editor_notes } = body;

    const updates: any = {};
    if (contentEn) updates.contentEn = contentEn;
    if (titleEn) updates.titleEn = titleEn;
    if (category) updates.category = category;
    if (monetization) updates.monetization = monetization;
    if (difficultyLevel) updates.difficulty_level = difficultyLevel;
    if (editor_notes) updates.editor_notes = editor_notes;

    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      // TODO: 从 Session 获取真实 User ID
      updates.reviewed_by = 'admin_user'; 
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
