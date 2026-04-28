import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;
    const { status, contentEn, titleEn, category, monetization, difficultyLevel } = body;

    const updates: any = {};
    if (contentEn) updates.contentEn = contentEn;
    if (titleEn) updates.titleEn = titleEn;
    if (category) updates.category = category;
    if (monetization) updates.monetization = monetization;
    if (difficultyLevel) updates.difficulty_level = difficultyLevel;

    // 🚀 Publish Logic
    if (status === 'approved') {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.reviewed_by = 'admin_current_session'; // TODO: Get real user ID from Session
    } else {
      updates.status = status; // scored, rejected, needs_rewrite
    }

    const { error } = await supabase.from('Article').update(updates).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
