import { NextRequest, NextResponse } from 'next/server';

// Paddle configuration
const PADDLE_API_URL = process.env.PADDLE_ENV === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';
const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';

// Plan mapping (Paddle price IDs)
const PLAN_MAP: Record<string, Record<string, string>> = {
  builder: {
    monthly: process.env.PADDLE_BUILDER_MONTHLY_PRICE_ID || '',
    yearly: process.env.PADDLE_BUILDER_YEARLY_PRICE_ID || '',
  },
  pro: {
    monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID || '',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, billing, email, name, successUrl, returnUrl } = body;

    if (!planId || !billing || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, billing, email' },
        { status: 400 }
      );
    }

    const priceId = PLAN_MAP[planId]?.[billing];
    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan: ${planId}/${billing}. Please configure PADDLE_${planId.toUpperCase()}_${billing.toUpperCase()}_PRICE_ID` },
        { status: 400 }
      );
    }

    // Simply return the price ID - Paddle.js will handle the checkout
    console.log('[Paddle] Returning price ID:', priceId);
    return NextResponse.json({
      priceId,
    });
  } catch (error: any) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET - Return Paddle configuration status
export async function GET() {
  const isConfigured = !!(PADDLE_API_KEY && 
    PLAN_MAP.builder.monthly && 
    PLAN_MAP.builder.yearly && 
    PLAN_MAP.pro.monthly && 
    PLAN_MAP.pro.yearly);

  return NextResponse.json({
    configured: isConfigured,
    environment: process.env.PADDLE_ENV || 'sandbox',
    plans: Object.keys(PLAN_MAP),
  });
}
