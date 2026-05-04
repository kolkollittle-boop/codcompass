import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resolvePrismaUserIdFromRequest } from '@/lib/dashboard-user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await resolvePrismaUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    const [bookmarkCount, viewGroups, viewsThisWeek] = await Promise.all([
      prisma.bookmark.count({ where: { userId } }),
      prisma.articleView.groupBy({
        by: ['articleId'],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.articleView.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { articleId: true },
      }),
    ]);

    const articlesRead = viewGroups.length;
    const articlesReadThisWeek = new Set(viewsThisWeek.map((v) => v.articleId)).size;

    return NextResponse.json({
      bookmarkCount,
      articlesRead,
      articlesReadThisWeek,
      memberSince: user?.createdAt?.toISOString() ?? null,
    });
  } catch (e) {
    console.error('[GET /api/user/stats]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
