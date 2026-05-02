import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';

type PaddleSubRow = Record<string, unknown>;

/**
 * GET /api/user/subscription
 * Returns the current user's subscription status from paddle_subscriptions table
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let email: string | null = session?.user?.email?.trim() || null;

    if (!email) {
      const authHeader = req.headers.get('authorization');
      const token =
        authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (token && url && anon) {
        const supabaseAuth = createClient(url, anon);
        const { data: udata, error: uerr } = await supabaseAuth.auth.getUser(token);
        if (!uerr && udata.user?.email) {
          email = udata.user.email.trim();
        }
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Prisma "User" row may not exist for pure NextAuth Google sign-in — still resolve Paddle by email
    const { data: user } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const userId = user?.id ?? null;
    const emailLower = email.toLowerCase();

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

    let rowsOwn: PaddleSubRow[] | null = null;
    let subError: unknown = null;

    if (userId) {
      const res = await supabaseAdmin
        .from('paddle_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      rowsOwn = (res.data as PaddleSubRow[] | null) ?? null;
      subError = res.error;
    }

    const { data: rowsByJsonEmail } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .filter('custom_data->>customer_email', 'ilike', email)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: orphanPool } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(500);

    const rowsOrphan =
      orphanPool?.filter((r) => {
        const ce = (r.custom_data as Record<string, unknown> | null)?.customer_email;
        return typeof ce === 'string' && ce.trim().toLowerCase() === emailLower;
      }) ?? [];

    const bySubId = new Map<string, PaddleSubRow>();
    const emailRows = (rowsByJsonEmail as PaddleSubRow[] | null) ?? [];
    for (const r of [...(rowsOwn ?? []), ...rowsOrphan, ...emailRows]) {
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

    if (subscription && !subscription.user_id && userId) {
      await supabaseAdmin
        .from('paddle_subscriptions')
        .update({ user_id: userId, updated_at: new Date().toISOString() })
        .eq('id', subscription.id as string);
    }

    if (subError || !subscription) {
      return NextResponse.json({
        plan: 'FREE',
        status: 'inactive',
        subscription: null
      });
    }

    const planType = typeof subscription.plan_type === 'string' ? subscription.plan_type : '';
    const statusStr = typeof subscription.status === 'string' ? subscription.status : '';

    return NextResponse.json({
      plan: planType ? planType.toUpperCase() : 'FREE',
      status: statusStr,
      subscription: {
        planType,
        billingCycle: subscription.billing_cycle,
        status: statusStr,
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
