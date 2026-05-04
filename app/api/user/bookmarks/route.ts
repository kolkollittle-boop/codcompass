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

    const articleIdCheck = req.nextUrl.searchParams.get('articleId')?.trim();
    if (articleIdCheck) {
      const count = await prisma.bookmark.count({
        where: { userId, articleId: articleIdCheck },
      });
      return NextResponse.json({ bookmarked: count > 0 });
    }

    const rows = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
          },
        },
      },
    });

    const bookmarks = rows.map((b) => ({
      id: b.id,
      articleId: b.articleId,
      slug: b.article.slug,
      title: b.article.titleEn,
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ bookmarks });
  } catch (e) {
    console.error('[GET /api/user/bookmarks]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const article = await prisma.article.findFirst({
      where: { id: articleId, isPublished: true },
      select: { id: true },
    });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await prisma.bookmark.upsert({
      where: {
        userId_articleId: { userId, articleId },
      },
      create: { userId, articleId },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[POST /api/user/bookmarks]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await resolvePrismaUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articleId = req.nextUrl.searchParams.get('articleId')?.trim();
    if (!articleId) {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: { userId, articleId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/user/bookmarks]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
