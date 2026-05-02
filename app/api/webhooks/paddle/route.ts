import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    if (customerEmail) {
      console.log(`[Paddle] Looking up user by email: ${customerEmail}`);
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .single();
      
      if (data && !error) {
        console.log(`[Paddle] Found user by email: ${data.id}`);
        return data.id;
      }
    }
    
    // Try to find user by customerId if it looks like an email
    if (customerId.includes('@')) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', customerId)
        .single();
      
      if (data && !error) {
        return data.id;
      }
    }
    
    // If customerId looks like a UUID, try to find user directly
    if (customerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', customerId)
        .single();
      
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
      .single();
    
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
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        plan_type: finalPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('[Paddle] Error syncing user plan:', error);
    } else {
      console.log(`[Paddle] User ${userId} plan synced to ${finalPlan}`);
    }
  } catch (error) {
    console.error('[Paddle] Error syncing user plan:', error);
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

  // Extract plan info from first item
  const firstItem = items[0];
  const priceId = firstItem?.price_id;
  const productId = firstItem?.price?.product_id;
  
  // Map product to plan type
  const planType = customData.plan_id || 'builder';
  const billingCycle = customData.billing_cycle || 'yearly';

  // Extract customer email from Paddle webhook data
  const customerEmail = data.customer?.email || data.email || null;

  // Find user by customer_id (with email fallback)
  const userId = await findUserIdByCustomerId(customerId, customerEmail);

  // Store transaction record
  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .insert({
      paddle_subscription_id: `txn_${transactionId}`,
      paddle_customer_id: customerId,
      user_id: userId,
      status: 'active',
      plan_id: productId,
      price_id: priceId,
      plan_type: planType,
      billing_cycle: billingCycle,
      custom_data: customData,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Paddle] Error storing transaction:', error);
  } else {
    console.log(`[Paddle] Transaction stored: ${transactionId}`);
    
    // Sync user plan if we found the user
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
  
  // Extract customer email from Paddle webhook data
  const customerEmail = data.customer?.email || data.email || null;
  
  // Add customer email to custom_data for future lookups
  const enrichedCustomData = {
    ...customData,
    customer_email: customerEmail,
  };
  
  console.log(`[Paddle] Subscription created: ${subscriptionId}, Status: ${status}, Customer: ${customerId}, Email: ${customerEmail}`);

  // Extract plan info
  const firstItem = data.items?.[0];
  const priceId = firstItem?.price_id;
  const productId = firstItem?.price?.product_id;
  const planType = customData.plan_id || 'builder';
  const billingCycle = customData.billing_cycle || 'yearly';

  // Find user by customer_id and email
  const userId = await findUserIdByCustomerId(customerId, customerEmail);

  // Store subscription in database
  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .insert({
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: customerId,
      user_id: userId,
      status: status,
      plan_id: productId,
      price_id: priceId,
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
    
    // Sync user plan if subscription is active
    if (status === 'active' && userId) {
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

  // Extract plan type if available
  const planType = customData.plan_id;

  // Update subscription in database
  const { data: existingSub, error: fetchError } = await supabaseAdmin
    .from('paddle_subscriptions')
    .select('user_id, plan_type')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .update({
      status: status,
      next_billed_at: data.next_billed_at,
      past_due_at: data.past_due_at,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('[Paddle] Error updating subscription:', error);
  } else if (existingSub?.user_id) {
    // Sync user plan based on subscription status
    const newPlanType = planType || existingSub.plan_type;
    if (status === 'active' && newPlanType) {
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

  // Update subscription status
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
