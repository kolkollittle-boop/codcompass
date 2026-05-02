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
    // Note: Prisma creates "User" table (capital U)
    console.log(`[Subscription API] Looking up user by email: ${session.user.email}`);
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', session.user.email)
      .single();

    console.log(`[Subscription API] User lookup result:`, user, userError);

    if (userError || !user) {
      console.log(`[Subscription API] User not found in "User" table, returning default`);
      // User might not be in the users table yet, return default
      return NextResponse.json({
        plan: 'FREE',
        status: 'inactive',
        subscription: null
      });
    }

    console.log(`[Subscription API] Found user ID: ${user.id}`);

    // Get the user's active subscription
    // Note: user.id is TEXT but user_id is UUID, Supabase should handle the cast automatically
    console.log(`[Subscription API] Looking up subscription for user_id: ${user.id}`);
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log(`[Subscription API] Subscription lookup result:`, subscription, subError);

    if (subError || !subscription) {
      console.log(`[Subscription API] No active subscription found, returning default`);
      return NextResponse.json({
        plan: 'FREE',
        status: 'inactive',
        subscription: null
      });
    }

    console.log(`[Subscription API] Found subscription:`, subscription.plan_type);

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
