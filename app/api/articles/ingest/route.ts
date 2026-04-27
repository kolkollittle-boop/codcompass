import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 🔐 1. 安全校验
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, sourceUrl, aiScore, aiFeedback, mentorSummary, difficultyLevel, dimensions } = body;

    // ⚖️ 2. 自动分流逻辑 (SOP 1)
    let status = 'scored';
    if (!aiScore || aiScore < 60 || body.isPromotional) {
      status = 'rejected';
    }

    // 💾 3. 数据持久化
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
        processed_at: new Date().toISOString(),
        monetization: difficultyLevel === 'L1' ? 'free' : 'premium' // SOP: L1 免费，L2+ 会员
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, status, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}