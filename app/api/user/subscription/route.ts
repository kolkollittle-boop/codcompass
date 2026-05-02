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
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
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

    // Get the user's active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

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
