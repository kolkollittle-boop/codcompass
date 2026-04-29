import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('Article')
    .select('*')
    .eq('status', 'REVIEW')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Article:', data.titleEn);
  console.log('Status:', data.status);
  console.log('Quality Score:', data.qualityScore);
  console.log('Quality Details:', JSON.stringify(data.qualityDetails, null, 2));
  console.log('\nContent preview (first 500 chars):');
  console.log(data.contentEn?.substring(0, 500));
}

main();
