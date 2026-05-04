import { NextRequest, NextResponse } from 'next/server';
import { resolvePrismaUserIdFromRequest } from '@/lib/dashboard-user';
import { ensureArticleViewRecorded } from '@/lib/article-view';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = await resolvePrismaUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const articleId = typeof body?.articleId === 'string' ? body.articleId.trim() : '';
    if (!articleId) {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 });
    }

    await ensureArticleViewRecorded(userId, articleId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[POST /api/user/article-view]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
