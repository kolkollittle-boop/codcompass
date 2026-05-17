import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import {
  fetchPaddleCustomerEmail,
  fetchPaddleCustomerIdsByEmail,
} from '@/lib/paddle-customer-api';

type PaddleSubRow = Record<string, unknown>;

export type SubscriptionPayload =
  | {
      plan: string;
      status: string;
      subscription: null;
    }
  | {
      plan: string;
      status: string;
      subscription: {
        planType: string;
        billingCycle: unknown;
        status: string;
        startedAt: unknown;
        nextBilledAt: unknown;
        canceledAt: unknown;
        customData: unknown;
      };
    };

function subscriptionLooksPaidRow(r: {
  status?: string | null;
  expires_at?: string | null;
}): boolean {
  const s = String(r.status || '').toLowerCase();
  if (s === 'refunded') return false;
  if (s === 'active' || s === 'trialing' || s === 'past_due') return true;
  if ((s === 'canceled' || s === 'cancelled') && r.expires_at) {
    return new Date(r.expires_at).getTime() > Date.now();
  }
  return false;
}

function isPaddleSubscriptionId(id: unknown): boolean {
  return String(id ?? '').startsWith('sub_');
}

function isPaddleTxnRowId(id: unknown): boolean {
  return String(id ?? '').startsWith('txn_');
}

function pickEffectivePaidSubscription(merged: PaddleSubRow[]): PaddleSubRow | null {
  const byCtm = new Map<string, PaddleSubRow[]>();
  for (const r of merged) {
    const ctm = typeof r.paddle_customer_id === 'string' ? r.paddle_customer_id.trim() : '';
    if (!ctm.startsWith('ctm_')) continue;
    if (!byCtm.has(ctm)) byCtm.set(ctm, []);
    byCtm.get(ctm)!.push(r);
  }

  const winners: PaddleSubRow[] = [];

  for (const [, rows] of byCtm) {
    const subRows = rows.filter((r) => isPaddleSubscriptionId(r.paddle_subscription_id));
    const paidSub = subRows.find((r) => subscriptionLooksPaidRow(r));
    if (paidSub) {
      winners.push(paidSub);
      continue;
    }
    if (subRows.length > 0) {
      continue;
    }
    const txnRows = rows.filter((r) => isPaddleTxnRowId(r.paddle_subscription_id));
    const paidTxn = txnRows.find((r) => subscriptionLooksPaidRow(r));
    if (paidTxn) winners.push(paidTxn);
  }

  if (!winners.length) return null;
  winners.sort(
    (a, b) =>
      new Date(b.created_at as string).getTime() -
      new Date(a.created_at as string).getTime()
  );
  return winners[0];
}

async function findPaidSubByPaddleCustomerForEmail(
  email: string,
  supabaseAdmin: SupabaseClient
): Promise<PaddleSubRow | null> {
  const emailLower = email.trim().toLowerCase();

  const ctmsFromApi = await fetchPaddleCustomerIdsByEmail(email);
  for (const ctm of ctmsFromApi) {
    const { data: rows } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .eq('paddle_customer_id', ctm)
      .order('updated_at', { ascending: false })
      .limit(50);
    const hit = pickEffectivePaidSubscription((rows as PaddleSubRow[]) ?? []);
    if (hit) return hit;
  }

  const { data: idRows } = await supabaseAdmin
    .from('paddle_subscriptions')
    .select('paddle_customer_id')
    .order('updated_at', { ascending: false })
    .limit(400);

  const seen = new Set<string>(ctmsFromApi);
  for (const row of idRows ?? []) {
    const ctm = row.paddle_customer_id as string | undefined;
    if (!ctm?.startsWith('ctm_') || seen.has(ctm)) continue;
    seen.add(ctm);
    const resolved = await fetchPaddleCustomerEmail(ctm);
    if (resolved?.trim().toLowerCase() !== emailLower) continue;
    const { data: rows } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('*')
      .eq('paddle_customer_id', ctm)
      .order('updated_at', { ascending: false })
      .limit(50);
    const hit = pickEffectivePaidSubscription((rows as PaddleSubRow[]) ?? []);
    if (hit) return hit;
  }
  return null;
}

/**
 * Resolve Paddle-backed subscription for an email (same rules as GET /api/user/subscription).
 */
export async function getSubscriptionPayloadForEmail(email: string): Promise<SubscriptionPayload> {
  const supabaseAdminClient = supabaseAdmin;
  if (!supabaseAdminClient) {
    return { plan: 'FREE', status: 'inactive', subscription: null };
  }

  const { data: user } = await supabaseAdminClient
    .from('User')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  const userId = user?.id ?? null;
  const emailLower = email.toLowerCase();

  let rowsOwn: PaddleSubRow[] | null = null;
  let subError: unknown = null;

  if (userId) {
    const res = await supabaseAdminClient
      .from('paddle_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    rowsOwn = (res.data as PaddleSubRow[] | null) ?? null;
    subError = res.error;
  }

  const { data: rowsByJsonEmail } = await supabaseAdminClient
    .from('paddle_subscriptions')
    .select('*')
    .filter('custom_data->>customer_email', 'ilike', email)
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: orphanPool } = await supabaseAdminClient
    .from('paddle_subscriptions')
    .select('*')
    .is('user_id', null)
    .order('created_at', { ascending: false })
    .limit(500);

  const rowsOrphan =
    orphanPool?.filter((r: PaddleSubRow) => {
      const ce = (r.custom_data as Record<string, unknown> | null)?.customer_email;
      return typeof ce === 'string' && ce.trim().toLowerCase() === emailLower;
    }) ?? [];

  const ctmsFromPaddle = await fetchPaddleCustomerIdsByEmail(email);
  const rowsByPaddleCustomer: PaddleSubRow[] = [];
  for (const ctm of ctmsFromPaddle) {
    const { data: rbc } = await supabaseAdminClient
      .from('paddle_subscriptions')
      .select('*')
      .eq('paddle_customer_id', ctm)
      .order('updated_at', { ascending: false })
      .limit(40);
    rowsByPaddleCustomer.push(...((rbc as PaddleSubRow[] | null) ?? []));
  }

  const bySubId = new Map<string, PaddleSubRow>();
  const emailRows = (rowsByJsonEmail as PaddleSubRow[] | null) ?? [];
  for (const r of [
    ...(rowsOwn ?? []),
    ...rowsOrphan,
    ...emailRows,
    ...rowsByPaddleCustomer,
  ]) {
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

  if (userId && subError) {
    console.error('[Subscription] paddle_subscriptions by user_id:', subError);
  }

  let subscription = pickEffectivePaidSubscription(merged);

  if (!subscription) {
    subscription = await findPaidSubByPaddleCustomerForEmail(email, supabaseAdminClient);
  }

  if (subscription && !subscription.user_id && userId) {
    await supabaseAdminClient
      .from('paddle_subscriptions')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq('id', subscription.id as string);
  }

  if (!subscription) {
    return {
      plan: 'FREE',
      status: 'inactive',
      subscription: null,
    };
  }

  const planType = typeof subscription.plan_type === 'string' ? subscription.plan_type : '';
  const statusStr = typeof subscription.status === 'string' ? subscription.status : '';

  return {
    plan: planType ? planType.toUpperCase() : 'FREE',
    status: statusStr,
    subscription: {
      planType,
      billingCycle: subscription.billing_cycle,
      status: statusStr,
      startedAt: subscription.started_at || null,
      nextBilledAt: subscription.next_billed_at || null,
      canceledAt: subscription.canceled_at || null,
      customData: subscription.custom_data,
    },
  };
}
