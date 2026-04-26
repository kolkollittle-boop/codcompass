#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔍 Raw Check...');

  // Select 5 without order
  const { data, error } = await supabase
    .from('Article')
    .select('titleEn, publishedAt')
    .limit(5);

  if (error) console.error("Error:", error);
  if (data) {
    data.forEach(a => console.log(`[${a.publishedAt}] ${a.titleEn.slice(0, 50)}`));
  }
  
  // Count by date
  const { count } = await supabase.from('Article').select('*', { count: 'exact', head: true });
  console.log(`Total: ${count}`);
}

main().catch(console.error);
