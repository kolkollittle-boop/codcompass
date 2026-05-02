-- Create Paddle subscriptions table
-- This table stores subscription data from Paddle payment gateway

CREATE TABLE IF NOT EXISTS paddle_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paddle_subscription_id TEXT UNIQUE NOT NULL,
  paddle_customer_id TEXT NOT NULL,
  user_id TEXT, -- References "User".id (TEXT type from Prisma)
  status TEXT NOT NULL DEFAULT 'trialing',
  plan_id TEXT,
  price_id TEXT NOT NULL,
  plan_type TEXT, -- 'builder' or 'pro'
  billing_cycle TEXT, -- 'monthly' or 'yearly'
  currency TEXT DEFAULT 'USD',
  price INTEGER, -- Price in cents
  quantity INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ,
  next_billed_at TIMESTAMPTZ,
  past_due_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  custom_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_user_id ON paddle_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_status ON paddle_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_paddle_customer_id ON paddle_subscriptions(paddle_customer_id);
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_plan_type ON paddle_subscriptions(plan_type);

-- Add RLS (Row Level Security) policies
ALTER TABLE paddle_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON paddle_subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow service role to manage all subscriptions (for webhook handler)
-- This is handled by using SUPABASE_SERVICE_ROLE_KEY in the webhook

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_paddle_subscriptions_updated_at
  BEFORE UPDATE ON paddle_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE paddle_subscriptions IS 'Stores subscription data from Paddle payment gateway';
COMMENT ON COLUMN paddle_subscriptions.status IS 'Subscription status: active, trialing, past_due, paused, canceled, expired';
COMMENT ON COLUMN paddle_subscriptions.plan_type IS 'Plan type: builder, pro';
COMMENT ON COLUMN paddle_subscriptions.billing_cycle IS 'Billing cycle: monthly, yearly';
COMMENT ON COLUMN paddle_subscriptions.price IS 'Price in cents (e.g., 999 = $9.99)';
