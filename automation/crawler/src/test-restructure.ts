// automation/crawler/src/test-restructure.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const { data, error } = await supabase
    .from('Article')
    .select('titleEn, status, qualityScore, qualityDetails, contentEn, slug')
    .order('createdAt', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('=== 最新文章 (最近5篇) ===\n');
  for (const article of data || []) {
    console.log('标题:', article.titleEn);
    console.log('Slug:', article.slug);
    console.log('状态:', article.status);
    console.log('评分:', article.qualityScore);
    console.log('难度:', article.qualityDetails?.difficulty_level);
    console.log('标签:', article.qualityDetails?.tags);
    console.log('阅读时间:', article.qualityDetails?.reading_time_minutes);
    console.log('预期收益:', article.qualityDetails?.expected_outcome);
    console.log('摘要:', article.qualityDetails?.excerpt);
    console.log('\n--- 内容预览 (前800字) ---');
    console.log(article.contentEn?.substring(0, 800));
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

main();
