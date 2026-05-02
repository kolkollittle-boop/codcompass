/**
 * Script to sync Paddle subscriptions with user accounts
 * This script:
 * 1. Checks existing paddle_subscriptions records
 * 2. For records without user_id, tries to find user by customer email
 * 3. Updates the user_id field
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncSubscriptions() {
  console.log('=== Paddle Subscription Sync ===\n');

  // 1. Check all paddle_subscriptions records
  const { data: subscriptions, error: subError } = await supabase
    .from('paddle_subscriptions')
    .select('*');

  if (subError) {
    console.error('Error fetching subscriptions:', subError);
    return;
  }

  console.log(`Found ${subscriptions?.length || 0} subscription records\n`);

  // 2. Show records without user_id
  const withoutUserId = subscriptions?.filter(s => !s.user_id) || [];
  console.log(`Records without user_id: ${withoutUserId.length}`);
  
  if (withoutUserId.length > 0) {
    console.log('\n--- Records needing user_id ---');
    withoutUserId.forEach(s => {
      console.log(`  ID: ${s.id}`);
      console.log(`  Customer ID: ${s.paddle_customer_id}`);
      console.log(`  Custom Data: ${JSON.stringify(s.custom_data)}`);
      console.log('');
    });
  }

  // 3. Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log(`\nFound ${users?.length || 0} users in database`);
  
  // Show kolkollittle@gmail.com user
  const targetUser = users?.find(u => u.email === 'kolkollittle@gmail.com');
  if (targetUser) {
    console.log(`\nTarget user (kolkollittle@gmail.com):`);
    console.log(`  User ID: ${targetUser.id}`);
  } else {
    console.log('\nTarget user (kolkollittle@gmail.com) NOT FOUND in users table');
  }

  // 4. Try to sync subscriptions without user_id
  for (const sub of withoutUserId) {
    const customData = sub.custom_data as any;
    const customerEmail = customData?.customer_email || customData?.email;
    
    if (customerEmail) {
      console.log(`\n--- Processing subscription ${sub.id} ---`);
      console.log(`  Customer Email: ${customerEmail}`);
      
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (user && !userError) {
        console.log(`  Found user: ${user.id}`);
        
        // Update subscription with user_id
        const { error: updateError } = await supabase
          .from('paddle_subscriptions')
          .update({ user_id: user.id })
          .eq('id', sub.id);

        if (updateError) {
          console.error(`  Error updating: ${updateError.message}`);
        } else {
          console.log(`  Successfully updated user_id`);
        }
      } else {
        console.log(`  User not found for email: ${customerEmail}`);
      }
    } else {
      console.log(`\n--- Subscription ${sub.id} has no email in custom_data ---`);
    }
  }

  console.log('\n=== Sync Complete ===');
}

syncSubscriptions().catch(console.error);
