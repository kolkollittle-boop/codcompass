import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Real data from database
    const totalArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    const totalCategories = await prisma.category.count();
    const totalUsers = await prisma.user.count();
    const activeSubscriptions = await prisma.user.count({ where: { subscriptionStatus: 'active' } });

    return NextResponse.json({
      totalViews: 0,
      totalClicks: 0,
      avgTimeOnPage: '0s',
      bounceRate: '0%',
      dailyViews: [],
      topArticles: [],
      trafficSources: [],
      // Extra real stats for reference
      totalArticles,
      totalCategories,
      totalUsers,
      activeSubscriptions,
      note: 'Page view tracking not implemented yet. Integrate Google Analytics, Plausible, or add a views table for real traffic data.',
    });
  } catch (e) {
    console.error('[Admin Analytics]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
