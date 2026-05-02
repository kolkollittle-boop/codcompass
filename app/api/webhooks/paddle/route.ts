import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { inferPlanFromPriceId } from '@/lib/paddle-plans';
import { fetchPaddleCustomerEmail } from '@/lib/paddle-customer-api';

/**
 * Paddle Webhook Handler
 * Handles events from Paddle for subscription lifecycle
 * Docs: https://developer.paddle.com/webhooks/
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Paddle webhook secret for signature verification
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';

/** Stable primary key for a `transaction.completed` row (avoid `txn_txn_...` if Paddle sends id with prefix). */
function paddleTxnSubscriptionId(transactionId: string | undefined | null): string {
  const raw = String(transactionId ?? '').trim();
  if (!raw) return 'txn_unknown';
  return raw.startsWith('txn_') ? raw : `txn_${raw}`;
}

/** Paddle Billing v2 line items use `price.id`, not top-level `price_id`. */
function lineItemPriceId(item: any): string | undefined {
  if (!item || typeof item !== 'object') return undefined;
  if (typeof item.price_id === 'string' && item.price_id) return item.price_id;
  const id = item.price?.id;
  return typeof id === 'string' && id ? id : undefined;
}

function lineItemProductId(item: any): string | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const pid = item.price?.product_id ?? item.product_id;
  return typeof pid === 'string' && pid ? pid : undefined;
}

/** Webhook payloads usually omit email; when expanded, `customer` may include it. */
function emailFromWebhookEntity(data: any): string | null {
  const c = data?.customer;
  if (c && typeof c === 'object' && typeof c.email === 'string' && c.email.trim()) {
    return c.email.trim();
  }
  if (typeof data?.email === 'string' && data.email.trim()) {
    return data.email.trim();
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    // Verify webhook signature (if secret is configured)
    if (PADDLE_WEBHOOK_SECRET) {
      const signature = req.headers.get('paddle-signature');
      if (!signature || !verifyWebhookSignature(rawBody, signature)) {
        console.error('[Paddle Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const eventType = body.event_type;
    const eventData = body.data;

    console.log(`[Paddle Webhook] Received event: ${eventType}`);

    switch (eventType) {
      case 'transaction.completed':
        await handleTransactionCompleted(eventData);
        break;

      case 'subscription.created':
      case 'subscription.trialing':
      case 'subscription.activated':
        await handleSubscriptionCreated(eventData);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(eventData);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(eventData);
        break;

      case 'subscription.past_due':
        await handleSubscriptionPastDue(eventData);
        break;

      case 'adjustment.created':
      case 'adjustment.updated':
        await handleAdjustmentRefund(eventData);
        break;

      default:
        console.log(`[Paddle Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Paddle Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify Paddle webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // Paddle uses HMAC-SHA256 for signature verification
  // Implementation depends on your Paddle webhook configuration
  // For now, return true if secret is configured
  return !!PADDLE_WEBHOOK_SECRET;
}

/**
 * Find user ID by Paddle customer ID
 * Assumes customer_id is either the user's email or Supabase user ID
 */
async function findUserIdByCustomerId(customerId: string, customerEmail?: string): Promise<string | null> {
  try {
    // First, try to find user by email (from Paddle customer data)
    // Note: Prisma creates "User" table (capital U)
    if (customerEmail) {
      console.log(`[Paddle] Looking up user by email: ${customerEmail}`);
      const { data, error } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (data && !error) {
        console.log(`[Paddle] Found user by email: ${data.id}`);
        return data.id;
      }
    }
    
    // Try to find user by customerId if it looks like an email
    if (customerId.includes('@')) {
      const { data, error } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('email', customerId)
        .maybeSingle();

      if (data && !error) {
        return data.id;
      }
    }
    
    // If customerId looks like a UUID, try to find user directly
    if (customerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data, error } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('id', customerId)
        .maybeSingle();

      if (data && !error) {
        return data.id;
      }
    }
    
    // Fallback: try to find by paddle_customer_id in existing subscriptions
    const { data } = await supabaseAdmin
      .from('paddle_subscriptions')
      .select('user_id')
      .eq('paddle_customer_id', customerId)
      .not('user_id', 'is', null)
      .limit(1)
      .maybeSingle();
    
    return data?.user_id || null;
  } catch (error) {
    console.error('[Paddle] Error finding user by customer ID:', error);
    return null;
  }
}

/**
 * Sync user plan type based on subscription status
 */
async function syncUserPlan(userId: string, planType: string): Promise<void> {
  const normalizedPlan = planType.toUpperCase();
  const validPlans = ['FREE', 'BUILDER', 'PRO', 'ENTERPRISE'];
  const finalPlan = validPlans.includes(normalizedPlan) ? normalizedPlan : 'FREE';
  
  try {
    // Try to update User table if it exists (Prisma-managed)
    // If the table doesn't exist, this will fail gracefully
    const { error } = await supabaseAdmin
      .from('User')
      .update({
        planType: finalPlan,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.warn('[Paddle] Could not sync user plan (users table may not exist):', error.message);
    } else {
      console.log(`[Paddle] User ${userId} plan synced to ${finalPlan}`);
    }
  } catch (error: any) {
    console.warn('[Paddle] Could not sync user plan:', error?.message || error);
  }
}

/**
 * Handle completed transaction (one-time payment or first subscription payment)
 */
async function handleTransactionCompleted(data: any) {
  const transactionId = data.id;
  const customerId = data.customer_id;
  const items = data.items || [];
  const customData = data.custom_data || {};
  
  console.log(`[Paddle] Transaction completed: ${transactionId}`);
  console.log(`[Paddle] Customer: ${customerId}, Plan: ${customData.plan_id}`);

  const firstItem = items[0];
  const priceId = lineItemPriceId(firstItem);
  const productId = lineItemProductId(firstItem);
  const inferred = inferPlanFromPriceId(priceId);

  const planType = customData.plan_id || inferred?.planType || 'builder';
  const billingCycle = customData.billing_cycle || inferred?.billingCycle || 'yearly';

  let customerEmail =
    emailFromWebhookEntity(data) ||
    (typeof customData.customer_email === 'string' ? customData.customer_email : null) ||
    null;
  if (!customerEmail) {
    customerEmail = await fetchPaddleCustomerEmail(customerId);
  }
  if (!customerEmail) {
    console.warn(
      '[Paddle] transaction.completed: no customer email (custom_data / API). customer_id=',
      customerId
    );
  }

  const userId = await findUserIdByCustomerId(customerId, customerEmail);

  const txnCustomData = {
    ...customData,
    customer_email: customerEmail || customData.customer_email,
  };

  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .insert({
      paddle_subscription_id: paddleTxnSubscriptionId(transactionId),
      paddle_customer_id: customerId || 'unknown',
      user_id: userId,
      status: 'active',
      plan_id: productId ?? null,
      price_id: priceId || 'unknown',
      plan_type: planType,
      billing_cycle: billingCycle,
      custom_data: txnCustomData,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Paddle] Error storing transaction:', error);
  } else {
    console.log(`[Paddle] Transaction stored: ${transactionId}`);
    if (userId) {
      await syncUserPlan(userId, planType);
    }
  }
}

/**
 * Handle new subscription created
 */
async function handleSubscriptionCreated(data: any) {
  const subscriptionId = data.id;
  const customerId = data.customer_id;
  const status = data.status;
  const customData = data.custom_data || {};
  
  let customerEmail =
    emailFromWebhookEntity(data) ||
    (typeof customData.customer_email === 'string' ? customData.customer_email : null) ||
    null;
  if (!customerEmail) {
    customerEmail = await fetchPaddleCustomerEmail(customerId);
  }
  if (!customerEmail) {
    console.warn(
      '[Paddle] subscription webhook: no customer email (custom_data / API). customer_id=',
      customerId
    );
  }

  const enrichedCustomData = {
    ...customData,
    customer_email: customerEmail?.trim() || customData.customer_email,
  };
  
  console.log(`[Paddle] Subscription created: ${subscriptionId}, Status: ${status}, Customer: ${customerId}, Email: ${customerEmail}`);

  const firstItem = data.items?.[0];
  const priceId = lineItemPriceId(firstItem);
  const productId = lineItemProductId(firstItem);
  const inferred = inferPlanFromPriceId(priceId);
  const planType = customData.plan_id || inferred?.planType || 'builder';
  const billingCycle = customData.billing_cycle || inferred?.billingCycle || 'yearly';

  // Find user by customer_id and email
  const userId = await findUserIdByCustomerId(customerId, customerEmail);

  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .insert({
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: customerId || 'unknown',
      user_id: userId,
      status: status,
      plan_id: productId ?? null,
      price_id: priceId || 'unknown',
      plan_type: planType,
      billing_cycle: billingCycle,
      started_at: data.started_at,
      next_billed_at: data.next_billed_at,
      custom_data: enrichedCustomData,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Paddle] Error storing subscription:', error);
  } else {
    console.log(`[Paddle] Subscription stored: ${subscriptionId}`);
    
    // Trial = trialing; paid period = active — both should unlock Pro/Builder in app
    if (userId && (status === 'active' || status === 'trialing')) {
      await syncUserPlan(userId, planType);
    }
  }
}

/**
 * Handle subscription updated (plan change, etc.)
 */
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id;
  const status = data.status;
  const customData = data.custom_data || {};

  console.log(`[Paddle] Subscription updated: ${subscriptionId}, New status: ${status}`);

  const firstItem = data.items?.[0];
  const priceId = lineItemPriceId(firstItem);
  const inferred = inferPlanFromPriceId(priceId);
  const planTypeFromPayload =
    customData.plan_id || inferred?.planType || undefined;

  const { data: existingSub, error: fetchError } = await supabaseAdmin
    .from('paddle_subscriptions')
    .select('user_id, plan_type')
    .eq('paddle_subscription_id', subscriptionId)
    .maybeSingle();

  if (fetchError) {
    console.error('[Paddle] Error loading subscription for update:', fetchError);
    return;
  }
  if (!existingSub) {
    await handleSubscriptionCreated(data);
    return;
  }

  const resolvedPlanType = planTypeFromPayload || existingSub.plan_type;

  const updatePayload: Record<string, unknown> = {
    status,
    plan_type: resolvedPlanType,
    next_billed_at: data.next_billed_at,
    past_due_at: data.past_due_at,
    updated_at: new Date().toISOString(),
  };
  if (inferred?.billingCycle) {
    updatePayload.billing_cycle = inferred.billingCycle;
  }

  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .update(updatePayload)
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('[Paddle] Error updating subscription:', error);
  } else if (existingSub?.user_id) {
    const newPlanType = resolvedPlanType;
    if ((status === 'active' || status === 'trialing') && newPlanType) {
      await syncUserPlan(existingSub.user_id, newPlanType);
    } else if (status === 'canceled' || status === 'expired') {
      await syncUserPlan(existingSub.user_id, 'free');
    }
  }
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(data: any) {
  const subscriptionId = data.id;

  console.log(`[Paddle] Subscription canceled: ${subscriptionId}`);

  const { data: existing } = await supabaseAdmin
    .from('paddle_subscriptions')
    .select('user_id')
    .eq('paddle_subscription_id', subscriptionId)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('[Paddle] Error canceling subscription:', error);
  } else if (existing?.user_id) {
    await syncUserPlan(existing.user_id as string, 'free');
  }
}

/**
 * Refund adjustments (Paddle Billing): when approved, mark matching subscription / txn row so /api/user/subscription shows Free.
 * @see https://developer.paddle.com/webhooks/adjustments/adjustment-updated
 */
async function handleAdjustmentRefund(data: any) {
  const action = data?.action;
  const adjStatus = data?.status;
  if (action !== 'refund') {
    return;
  }
  if (adjStatus !== 'approved') {
    console.log(`[Paddle] adjustment: refund not approved yet (${adjStatus}), id=${data?.id}`);
    return;
  }

  const subscriptionId =
    typeof data.subscription_id === 'string' && data.subscription_id
      ? data.subscription_id
      : null;
  const transactionId =
    typeof data.transaction_id === 'string' && data.transaction_id
      ? data.transaction_id
      : null;

  console.log('[Paddle] Refund approved:', {
    adjustmentId: data?.id,
    subscriptionId,
    transactionId,
  });

  const now = new Date().toISOString();

  async function syncUsersForPaddleSubIds(ids: string[]) {
    const uids = new Set<string>();
    for (const sid of ids) {
      const { data: rows } = await supabaseAdmin
        .from('paddle_subscriptions')
        .select('user_id')
        .eq('paddle_subscription_id', sid);
      for (const r of rows ?? []) {
        const u = (r as { user_id?: string }).user_id;
        if (u) uids.add(u);
      }
    }
    for (const uid of uids) {
      await syncUserPlan(uid, 'free');
    }
  }

  const touchedIds: string[] = [];

  if (subscriptionId) {
    const { error } = await supabaseAdmin
      .from('paddle_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: now,
        updated_at: now,
      })
      .eq('paddle_subscription_id', subscriptionId);
    if (error) {
      console.error('[Paddle] refund: subscription row update', error);
    } else {
      touchedIds.push(subscriptionId);
    }
  }

  if (transactionId) {
    const txnKey = paddleTxnSubscriptionId(transactionId);
    const { error } = await supabaseAdmin
      .from('paddle_subscriptions')
      .update({
        status: 'refunded',
        canceled_at: now,
        updated_at: now,
      })
      .eq('paddle_subscription_id', txnKey);
    if (error) {
      console.error('[Paddle] refund: transaction row update', error);
    } else {
      touchedIds.push(txnKey);
    }
  }

  if (touchedIds.length) {
    await syncUsersForPaddleSubIds(touchedIds);
  }
}

/**
 * Handle subscription past due (payment failed)
 */
async function handleSubscriptionPastDue(data: any) {
  const subscriptionId = data.id;

  console.log(`[Paddle] Subscription past due: ${subscriptionId}`);

  // Update subscription status
  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .update({
      status: 'past_due',
      past_due_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('[Paddle] Error updating subscription:', error);
  }
}

// Handle other HTTP methods
export function GET() {
  return NextResponse.json({ message: 'Paddle webhook endpoint' });
}

export function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
