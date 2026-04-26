#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔍 Checking Articles in Database...');

  // Count total
  const { count } = await supabase.from('Article').select('*', { count: 'exact', head: true });
  console.log(`📊 Total Articles: ${count}`);

  // Get latest 10
  const { data } = await supabase
    .from('Article')
    .select('titleEn, publishedAt, sourceUrl')
    .order('publishedAt', { ascending: false })
    .limit(10);

  console.log('\n📅 Latest Articles:');
  if (data) {
    data.forEach(a => {
      console.log(`- [${a.publishedAt.slice(0, 10)}] ${a.titleEn.slice(0, 60)}`);
    });
  }
}

main().catch(console.error);
