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

    // Get all users with subscription data
    const users = await prisma.user.findMany({
      select: { planType: true, subscriptionStatus: true },
    });

    const totalSubscribers = users.filter(u => u.planType && u.planType !== 'FREE').length;
    const activeSubscriptions = users.filter(u => u.subscriptionStatus === 'ACTIVE').length;
    const canceledSubscriptions = users.filter(u => u.subscriptionStatus === 'CANCELED' || u.subscriptionStatus === 'INACTIVE').length;

    // Simple MRR/ARR calculation (placeholder pricing)
    const planPrices: Record<string, number> = { FREE: 0, BUILDER: 9, PRO: 29, ENTERPRISE: 99 };
    let mrr = 0;
    const byPlan: Record<string, { count: number; revenue: number }> = {};
    
    for (const u of users) {
      const plan = u.planType?.toUpperCase() || 'FREE';
      const price = planPrices[plan] || 0;
      if (u.subscriptionStatus === 'ACTIVE') {
        mrr += price;
        if (!byPlan[plan]) byPlan[plan] = { count: 0, revenue: 0 };
        byPlan[plan].count++;
        byPlan[plan].revenue += price;
      }
    }

    return NextResponse.json({
      totalSubscribers,
      activeSubscriptions,
      canceledSubscriptions,
      mrr,
      arr: mrr * 12,
      byPlan: Object.entries(byPlan).map(([plan, data]) => ({ plan, ...data })),
      recentSubscriptions: [], // Will be populated when Paddle/stripe integration is done
    });
  } catch (e) {
    console.error('[Admin Subscriptions]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
