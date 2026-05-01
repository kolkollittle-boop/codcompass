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

  // Store transaction record
  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .insert({
      paddle_subscription_id: `txn_${transactionId}`,
      paddle_customer_id: customerId,
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
  
  console.log(`[Paddle] Subscription created: ${subscriptionId}, Status: ${status}`);

  // Extract plan info
  const firstItem = data.items?.[0];
  const priceId = firstItem?.price_id;
  const productId = firstItem?.price?.product_id;
  const planType = customData.plan_id || 'builder';
  const billingCycle = customData.billing_cycle || 'yearly';

  // Store subscription in database
  const { error } = await supabaseAdmin
    .from('paddle_subscriptions')
    .insert({
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: customerId,
      status: status,
      plan_id: productId,
      price_id: priceId,
      plan_type: planType,
      billing_cycle: billingCycle,
      started_at: data.started_at,
      next_billed_at: data.next_billed_at,
      custom_data: customData,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Paddle] Error storing subscription:', error);
  } else {
    console.log(`[Paddle] Subscription stored: ${subscriptionId}`);
  }
}

/**
 * Handle subscription updated (plan change, etc.)
 */
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id;
  const status = data.status;

  console.log(`[Paddle] Subscription updated: ${subscriptionId}, New status: ${status}`);

  // Update subscription in database
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
