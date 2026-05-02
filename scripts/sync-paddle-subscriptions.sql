-- Sync Paddle subscriptions with user accounts
-- This script links paddle_subscriptions records to users based on email in custom_data

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

-- Step 2: Check if kolkollittle@gmail.com exists in users table
SELECT id, email, created_at 
FROM users 
WHERE email = 'kolkollittle@gmail.com';

-- Step 3: Update paddle_subscriptions with user_id based on email in custom_data
-- This matches customer_email from custom_data to users.email
UPDATE paddle_subscriptions
SET user_id = u.id
FROM users u
WHERE paddle_subscriptions.user_id IS NULL
  AND paddle_subscriptions.custom_data->>'customer_email' = u.email;

-- Step 4: Verify the update
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
LEFT JOIN users u ON ps.user_id = u.id
ORDER BY ps.created_at DESC;

-- Step 5: If you need to manually add a subscription for a user, use this template:
-- UPDATE paddle_subscriptions
-- SET user_id = (SELECT id FROM users WHERE email = 'kolkollittle@gmail.com')
-- WHERE paddle_customer_id = 'ctm_xxxxxxxxxxxxx' AND user_id IS NULL;
