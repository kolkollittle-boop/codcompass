import { NextRequest, NextResponse } from 'next/server';

// Paddle configuration
const PADDLE_API_URL = 'https://sandbox-api.paddle.com'; // Use sandbox for testing
const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_CHECKOUT_URL = process.env.PADDLE_CHECKOUT_URL || 'https://sandbox-checkout.paddle.com';

// Plan mapping (Paddle product IDs)
const PLAN_MAP: Record<string, Record<string, string>> = {
  builder: {
    monthly: process.env.PADDLE_BUILDER_MONTHLY_ID || 'pri_builder_monthly',
    yearly: process.env.PADDLE_BUILDER_YEARLY_ID || 'pri_builder_yearly',
  },
  pro: {
    monthly: process.env.PADDLE_PRO_MONTHLY_ID || 'pri_pro_monthly',
    yearly: process.env.PADDLE_PRO_YEARLY_ID || 'pri_pro_yearly',
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const planId = formData.get('planId') as string;
    const billing = formData.get('billing') as string;
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    if (!planId || !billing || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const plan = PLAN_MAP[planId]?.[billing];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // For now, redirect to Paddle checkout URL
    // In production, you'd create a Paddle checkout session via API
    const paddleCheckoutUrl = `${PADDLE_CHECKOUT_URL}/checkout/${plan}?email=${encodeURIComponent(email)}`;

    return NextResponse.redirect(paddleCheckoutUrl);
  } catch (error: any) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
