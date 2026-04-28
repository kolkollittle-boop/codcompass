import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. 显式定义 Next.js 15 的 Context 类型
// 注意：params 必须是 Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH 方法：用于更新文章状态或内容
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ✅ 关键修复：必须 await 整个 params 对象
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

    // 状态流转逻辑
    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.reviewed_by = 'admin_user'; 
    } else if (status) {
      updates.status = status;
    }

    // 更新数据库
    const { error } = await supabase
      .from('Article')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`❌ [PATCH] Error at /api/articles/${(await context.params).id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET 方法：获取单篇文章详情
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ✅ 同样的修复：必须 await params
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('Article')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}