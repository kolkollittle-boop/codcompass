import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 🔐 1. Security Check
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, sourceUrl, aiScore, aiFeedback, mentorSummary, difficultyLevel, dimensions } = body;

    // ⚖️ 2. Auto-routing Logic (SOP 1)
    // If score < 60 or promotional, mark as rejected. Otherwise scored.
    let status = 'scored';
    if (!aiScore || aiScore < 60 || body.isPromotional) {
      status = 'rejected';
    }

    // 💾 3. Persistence
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
        // Auto-set monetization based on difficulty (SOP 5)
        monetization: difficultyLevel === 'L1' ? 'free' : 'premium' 
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, status, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
