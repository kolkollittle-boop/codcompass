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
  const { data: articles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, slug')
    .eq('sourceSite', 'ai-deep-generated')
    .order('createdAt', { ascending: false });

  if (!articles || articles.length === 0) {
    console.log('No deep-generated articles found');
    return;
  }

  // Find duplicate titles
  const titleMap: Record<string, string[]> = {};
  for (const a of articles) {
    if (!titleMap[a.titleEn]) titleMap[a.titleEn] = [];
    titleMap[a.titleEn].push(a.id);
  }

  const duplicates = Object.entries(titleMap).filter(([, ids]) => ids.length > 1);
  console.log('=== Deep-generated articles:', articles.length, '===');
  console.log('=== Duplicate titles:', duplicates.length, '===');
  for (const [title, ids] of duplicates.slice(0, 10)) {
    console.log('  DUP:', title, '->', ids.length, 'copies');
  }

  // Check if content starts with the title (title duplicated in body)
  let titleInContent = 0;
  for (const a of articles) {
    if (a.contentEn && a.titleEn) {
      const trimmed = a.contentEn.trim();
      if (trimmed.startsWith('# ' + a.titleEn) || trimmed.startsWith('## ' + a.titleEn)) {
        titleInContent++;
      }
    }
  }
  console.log('=== Title duplicated in content:', titleInContent, '/', articles.length, '===');
  
  // Show a sample
  if (titleInContent > 0) {
    const sample = articles.find(a => a.contentEn && a.titleEn && a.contentEn.trim().startsWith('# ' + a.titleEn));
    if (sample) {
      console.log('\nSample:');
      console.log('Title:', sample.titleEn);
      console.log('Content start:', sample.contentEn.substring(0, 200));
    }
  }
}

main().catch(console.error);
