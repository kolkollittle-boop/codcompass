import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';

/**
 * GET /api/user/subscription
 * Returns the current user's subscription status from paddle_subscriptions table
 */
export async function GET(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, get the user's Supabase ID from their email
    // Note: Prisma creates "User" table (capital U) with TEXT id
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      // User might not be in the users table yet, return default
      return NextResponse.json({
        plan: 'FREE',
        status: 'inactive',
        subscription: null
      });
    }

    const emailLower = session.user.email.trim().toLowerCase();

    function subscriptionLooksPaid(r: {
      status?: string | null;
      expires_at?: string | null;
    }): boolean {
      const s = r.status || '';
      if (s === 'active' || s === 'trialing' || s === 'past_due') return true;
      if ((s === 'canceled' || s === 'cancelled') && r.expires_at) {
        return new Date(r.expires_at).getTime() > Date.now();
      }
      return false;
    }

    const { data: rowsOwn, error: subError } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: orphanPool } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(100);

    const rowsOrphan =
      orphanPool?.filter((r) => {
        const ce = (r.custom_data as Record<string, unknown> | null)?.customer_email;
        return typeof ce === 'string' && ce.trim().toLowerCase() === emailLower;
      }) ?? [];

    const bySubId = new Map<string, (typeof rowsOwn)[number]>();
    for (const r of [...(rowsOwn ?? []), ...rowsOrphan]) {
      const key = r.paddle_subscription_id as string;
      const prev = bySubId.get(key);
      if (!prev || (!prev.user_id && r.user_id)) {
        bySubId.set(key, r);
      }
    }
    const merged = [...bySubId.values()].sort(
      (a, b) =>
        new Date(b.created_at as string).getTime() -
        new Date(a.created_at as string).getTime()
    );

    const subscription = merged.find((r) => subscriptionLooksPaid(r)) ?? null;

    if (subscription && !subscription.user_id && user.id) {
      await supabaseAdmin
        .from('paddle_subscriptions')
        .update({ user_id: user.id, updated_at: new Date().toISOString() })
        .eq('id', subscription.id as string);
    }

    if (subError || !subscription) {
      return NextResponse.json({
        plan: 'FREE',
        status: 'inactive',
        subscription: null
      });
    }

    return NextResponse.json({
      plan: subscription.plan_type?.toUpperCase() || 'FREE',
      status: subscription.status,
      subscription: {
        planType: subscription.plan_type,
        billingCycle: subscription.billing_cycle,
        status: subscription.status,
        startedAt: subscription.started_at || null,
        nextBilledAt: subscription.next_billed_at || null,
        canceledAt: subscription.canceled_at || null,
        customData: subscription.custom_data
      }
    });
  } catch (error: any) {
    console.error('[Subscription API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
