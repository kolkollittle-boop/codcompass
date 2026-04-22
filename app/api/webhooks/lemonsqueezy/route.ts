import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Lemon Squeezy
    // In a real implementation, you would verify the signature
    // const signature = req.headers.get('X-Signature');

    const payload = await req.json();

    // Handle different event types
    switch (payload.meta.event_name) {
      case 'order_created':
        console.log('Order created:', payload.data);
        // Process order creation
        break;

      case 'subscription_created':
        console.log('Subscription created:', payload.data);
        // Process subscription creation
        break;

      case 'subscription_updated':
        console.log('Subscription updated:', payload.data);
        // Process subscription update
        break;

      case 'subscription_cancelled':
        console.log('Subscription cancelled:', payload.data);
        // Process subscription cancellation
        break;

      default:
        console.log('Unhandled event:', payload.meta.event_name);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

// Export a default handler for other methods if needed
export const GET = POST;