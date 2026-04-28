import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Next.js 15 规范：定义 Params 类型
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    // 1. 异步获取 ID
    const { id } = await params;
    
    // 2. 解析 Request Body
    const body = await req.json();
    const { status, contentEn, titleEn, category, monetization, difficultyLevel, editor_notes } = body;

    // 3. 构建更新对象 (保持字段名映射正确)
    const updates: any = {};
    if (contentEn) updates.contentEn = contentEn;
    if (titleEn) updates.titleEn = titleEn;
    if (category) updates.category = category;
    if (monetization) updates.monetization = monetization;
    if (difficultyLevel) updates.difficulty_level = difficultyLevel; // 数据库是下划线命名
    if (editor_notes) updates.editor_notes = editor_notes;

    // 4. 状态流转逻辑
    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.reviewed_by = 'admin_user'; 
    } else if (status) {
      updates.status = status;
    }

    // 5. 执行数据库更新
    const { error } = await supabase
      .from('Article')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('🔥 PATCH Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 💡 顺便帮你检查/准备好 GET 函数，防止连带报错
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('Article')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}