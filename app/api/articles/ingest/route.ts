import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 辅助函数：从标题生成 URL 友好的 Slug
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  // 🔐 1. 安全校验
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, sourceUrl, aiScore, aiFeedback, mentorSummary, difficultyLevel, isPromotional } = body;

    if (!title || !content) {
        return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    // ⚖️ 2. 自动分流逻辑
    let status = 'scored';
    if (!aiScore || aiScore < 60 || isPromotional) {
      status = 'rejected';
    }

    // 🔗 3. 生成唯一 Slug
    const uniqueSlug = `${generateSlug(title)}-${Date.now().toString().slice(-6)}`;

    // 💾 4. 数据持久化
    const { data, error } = await supabase
      .from('Article')
      .insert({
        titleEn: title,
        contentEn: content,
        source_url: sourceUrl,
        status: status,
        ai_score: aiScore,
        ai_feedback: aiFeedback,
        mentor_summary: mentorSummary,
        difficulty_level: difficultyLevel || 'L2',
        slug: uniqueSlug,
        processed_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        monetization: difficultyLevel === 'L1' ? 'free' : 'premium'
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, status, data });
  } catch (error: any) {
    console.error('[Ingest Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
