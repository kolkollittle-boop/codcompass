import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log('Checking articles in database...');
  
  // 查询所有文章
  const { data, error } = await supabase
    .from('Article')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total articles: ${data?.length || 0}`);
  
  if (data && data.length > 0) {
    console.log('\nArticles by status:');
    const statusCount: Record<string, number> = {};
    data.forEach((a: any) => {
      const status = a.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    console.log(statusCount);
    
    console.log('\nRecent articles:');
    data.forEach((a: any) => {
      console.log(`- [${a.status}] ${a.titleEn} (score: ${a.ai_score}, created: ${a.createdAt})`);
    });
  } else {
    console.log('No articles found in database.');
  }
}

check();
