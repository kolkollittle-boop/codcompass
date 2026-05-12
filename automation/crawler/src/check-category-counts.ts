import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: links } = await supabase.from('_ArticleToCategory').select('A, B');
  const { data: categories } = await supabase.from('Category').select('id, slug, name');
  const { data: articles } = await supabase.from('Article').select('id, status, sourceSite');
  
  const articleStatus: Record<string, any> = {};
  for (const a of articles || []) {
    articleStatus[a.id] = a;
  }
  
  console.log('=== 分类 PUBLISHED 文章统计 ===');
  for (const cat of categories || []) {
    const catLinks = (links || []).filter(l => l.B === cat.id);
    const published = catLinks.filter(l => articleStatus[l.A]?.status === 'PUBLISHED');
    console.log(cat.slug + ': ' + published.length + ' PUBLISHED');
  }
  
  const totalPublished = (articles || []).filter(a => a.status === 'PUBLISHED').length;
  const totalReview = (articles || []).filter(a => a.status === 'REVIEW').length;
  const aiReview = (articles || []).filter(a => a.status === 'REVIEW' && a.sourceSite === 'ai-generated').length;
  console.log('\n总计: ' + totalPublished + ' PUBLISHED, ' + totalReview + ' REVIEW, ' + aiReview + ' AI-REVIEW');
}

main().catch(console.error);
