import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Checking articles in DB...');
  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn')
    .order('publishedAt', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${articles?.length || 0} recent articles:`);
  articles?.forEach((a, i) => {
    console.log(`--- Article ${i + 1} ---`);
    console.log(`Title: ${a.titleEn}`);
    console.log(`Content Length: ${a.contentEn?.length || 0} chars`);
    console.log(`Preview: ${a.contentEn?.substring(0, 100)}...`);
    console.log('');
  });
}

main();
