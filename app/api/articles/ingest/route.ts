import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ 1. 定义严格的 Context 类型
type Context = {
  params: Promise<{ id: string }>;
};

// ✅ 2. 确保 PATCH 函数签名完全符合 Next.js 15 约束
export async function PATCH(
  request: NextRequest, 
  context: Context
) {
  try {
    // 关键点：必须先 await params
    const { id } = await context.params;
    
    const body = await request.json();
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
      updates.reviewed_by = 'admin_user'; 
    } else if (status) {
      updates.status = status;
    }

    const { error } = await supabase
      .from('Article')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ 3. 同样的，GET 也必须这样写，否则 Build 还是会挂
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const { data, error } = await supabase
      .from('Article')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}