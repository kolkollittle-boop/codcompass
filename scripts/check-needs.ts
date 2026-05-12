import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: links } = await supabase.from('_ArticleToCategory').select('A, B');
  const { data: categories } = await supabase.from('Category').select('id, slug, name');
  const { data: articles } = await supabase.from('Article').select('id, status');
  
  const articleStatus: Record<string, string> = {};
  for (const a of articles || []) articleStatus[a.id] = a.status;
  
  console.log('=== 分类 PUBLISHED 统计 ===');
  const needs: string[] = [];
  for (const cat of categories || []) {
    const catLinks = (links || []).filter(l => l.B === cat.id);
    const published = catLinks.filter(l => articleStatus[l.A] === 'PUBLISHED').length;
    if (published < 10 && !['cc20-archive', 'cc20-references'].includes(cat.slug)) {
      const need = 10 - published;
      console.log(cat.slug + ': ' + published + ' published, need ' + need + ' more');
      needs.push(cat.slug);
    }
  }
  console.log('\n需要补录的分类:', needs.join(', '));
  console.log('共', needs.length, '个分类需要补录');
}
main().catch(console.error);
