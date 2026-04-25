import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Lemon Squeezy Webhook Handler
 * 
 * Security: Verifies HMAC-SHA256 signature from Lemon Squeezy
 * Docs: https://docs.lemonsqueezy.com/help/webhooks
 */

function bufferToString(buf: Buffer): string {
  return buf.toString('utf8');
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature, 'utf8');
    const expBuffer = Buffer.from(expectedSignature, 'utf8');
    
    if (sigBuffer.length !== expBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expBuffer);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    // Reject if webhook secret not configured
    if (!webhookSecret) {
      console.error('[Webhook] LEMONSQUEEZY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 503 }
      );
    }

    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature');

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      console.warn('[Webhook] Invalid signature from', clientIp);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Parse JSON payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // Handle different event types
    const eventName = payload.meta?.event_name;
    console.log(`[Webhook] Received event: ${eventName}`);

    switch (eventName) {
      case 'order_created':
        console.log('[Webhook] Order created:', payload.data?.id);
        // TODO: Process order - create user record, send confirmation
        break;

      case 'subscription_created':
        console.log('[Webhook] Subscription created:', payload.data?.id);
        // TODO: Activate user subscription
        break;

      case 'subscription_updated':
        console.log('[Webhook] Subscription updated:', payload.data?.id);
        // TODO: Update subscription status
        break;

      case 'subscription_cancelled':
        console.log('[Webhook] Subscription cancelled:', payload.data?.id);
        // TODO: Schedule subscription end
        break;

      case 'subscription_expired':
        console.log('[Webhook] Subscription expired:', payload.data?.id);
        // TODO: Deactivate user subscription
        break;

      case 'subscription_paused':
      case 'subscription_resumed':
        console.log(`[Webhook] Subscription ${eventName}:`, payload.data?.id);
        break;

      case 'refund_created':
        console.log('[Webhook] Refund created:', payload.data?.id);
        // TODO: Handle refund - revoke access
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
