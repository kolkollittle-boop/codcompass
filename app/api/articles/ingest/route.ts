import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ✅ Next.js 15 核心修复：
 * 显式定义 context 类型，params 必须是 Promise
 */
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  req: NextRequest, 
  context: RouteContext // 使用 context 包装 params
) {
  try {
    // 1. 先异步解构出 id
    const { id } = await context.params;
    
    // 2. 解析请求体
    const body = await req.json();
    const { status, contentEn, titleEn, category, monetization, difficultyLevel, editor_notes } = body;

    // 3. 准备更新字段
    const updates: any = {};
    if (contentEn) updates.contentEn = contentEn;
    if (titleEn) updates.titleEn = titleEn;
    if (category) updates.category = category;
    if (monetization) updates.monetization = monetization;
    if (difficultyLevel) updates.difficulty_level = difficultyLevel;
    if (editor_notes) updates.editor_notes = editor_notes;

    // 4. 业务逻辑处理
    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.reviewed_by = 'admin_user'; 
    } else if (status) {
      updates.status = status;
    }

    // 5. 更新数据库
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

// 💡 记得把 GET 也一并改了，防止 Build 报同样的错误
export async function GET(
  req: NextRequest,
  context: RouteContext
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