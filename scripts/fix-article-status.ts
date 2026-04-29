import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixStatus() {
  console.log('Fixing article status values...');
  
  // 将 scored 改为 REVIEW
  const { error: error1 } = await supabase
    .from('Article')
    .update({ status: 'REVIEW' })
    .eq('status', 'scored');
    
  if (error1) {
    console.error('Error updating scored -> REVIEW:', error1);
  } else {
    console.log('Updated scored -> REVIEW');
  }
  
  // 将 rejected 改为 ARCHIVED
  const { error: error2 } = await supabase
    .from('Article')
    .update({ status: 'ARCHIVED' })
    .eq('status', 'rejected');
    
  if (error2) {
    console.error('Error updating rejected -> ARCHIVED:', error2);
  } else {
    console.log('Updated rejected -> ARCHIVED');
  }
  
  console.log('Done!');
}

fixStatus();
