import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase（建议只在服务端使用 service_role_key）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Next.js 15 正确的 Context 类型
type Context = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/articles/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: Context          // ← 必须这样写
) {
  try {
    const { id } = await context.params;   // ← 必须 await

    const body = await request.json();

    const { 
      status, 
      contentEn, 
      titleEn, 
      category, 
      monetization, 
      difficultyLevel, 
      editor_notes 
    } = body;

    const updates: Record<string, any> = {};

    if (contentEn !== undefined) updates.contentEn = contentEn;
    if (titleEn !== undefined) updates.titleEn = titleEn;
    if (category !== undefined) updates.category = category;
    if (monetization !== undefined) updates.monetization = monetization;
    if (difficultyLevel !== undefined) updates.difficulty_level = difficultyLevel;
    if (editor_notes !== undefined) updates.editor_notes = editor_notes;

    // 状态流转
    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.reviewed_by = 'admin_user';
    } else if (status !== undefined) {
      updates.status = status;
    }

    const { error } = await supabase
      .from('Article')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`❌ [PATCH] Error updating article ${id ? '(id exists)' : ''}:`, error);
    return NextResponse.json(
      { error: error.message || '更新失败' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/articles/[id]
 */
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
    if (!data) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`❌ [GET] Error fetching article:`, error);
    return NextResponse.json(
      { error: error.message || '获取失败' }, 
      { status: 500 }
    );
  }
}