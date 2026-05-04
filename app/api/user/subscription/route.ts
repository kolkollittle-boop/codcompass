import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';
import { getSubscriptionPayloadForEmail } from '@/lib/subscription-for-email';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0' } as const;

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const payload = await getSubscriptionPayloadForEmail(email);
    return NextResponse.json(payload, { headers: NO_STORE_HEADERS });
  } catch (error: unknown) {
    console.error('[Subscription API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
