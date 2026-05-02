-- Sync Paddle subscriptions with user accounts
-- This script links paddle_subscriptions records to users based on email in custom_data
-- Note: Prisma creates "User" table with TEXT id (cuid), not UUID

-- Step 1: Check current state of paddle_subscriptions
SELECT 
  id,
  paddle_customer_id,
  user_id,
  status,
  plan_type,
  custom_data->>'customer_email' as customer_email,
  created_at
FROM paddle_subscriptions
ORDER BY created_at DESC;

-- Step 2: Check if user exists in "User" table
SELECT id, email, "planType", "subscriptionStatus" 
FROM "User" 
WHERE email = 'kolkollittle@gmail.com';

-- Step 3: Fix schema incompatibility (UUID vs TEXT)
-- 3a. Drop foreign key constraint
ALTER TABLE paddle_subscriptions 
DROP CONSTRAINT IF EXISTS paddle_subscriptions_user_id_fkey;

-- 3b. Drop RLS policy that depends on user_id
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON paddle_subscriptions;

-- 3c. Change user_id column type to TEXT
ALTER TABLE paddle_subscriptions 
ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Update paddle_subscriptions with user_id based on email in custom_data
UPDATE paddle_subscriptions
SET user_id = u.id
FROM "User" u
WHERE paddle_subscriptions.user_id IS NULL
  AND paddle_subscriptions.custom_data->>'customer_email' = u.email;

-- Step 5: Recreate RLS policy
CREATE POLICY "Users can view their own subscriptions"
  ON paddle_subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Step 6: Verify the update
SELECT 
  ps.id,
  ps.paddle_customer_id,
  ps.user_id,
  u.email,
  ps.status,
  ps.plan_type,
  ps.started_at,
  ps.created_at
FROM paddle_subscriptions ps
LEFT JOIN "User" u ON ps.user_id = u.id
ORDER BY ps.created_at DESC;
