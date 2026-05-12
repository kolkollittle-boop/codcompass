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
  // Check ALL published articles for issues
  const { data: articles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, slug, status')
    .eq('status', 'PUBLISHED');

  if (!articles) {
    console.log('No articles found');
    return;
  }

  console.log('Total PUBLISHED articles:', articles.length);

  // 1. Find duplicate titles
  const titleMap: Record<string, { id: string; sourceSite: string }[]> = {};
  for (const a of articles) {
    if (!titleMap[a.titleEn]) titleMap[a.titleEn] = [];
    titleMap[a.titleEn].push({ id: a.id, sourceSite: a.sourceSite });
  }

  const duplicates = Object.entries(titleMap).filter(([, entries]) => entries.length > 1);
  console.log('\n=== Duplicate titles:', duplicates.length, '===');
  for (const [title, entries] of duplicates.slice(0, 15)) {
    console.log(`  "${title.slice(0, 80)}" -> ${entries.length} copies [${entries.map(e => e.sourceSite).join(', ')}]`);
  }
  if (duplicates.length > 15) {
    console.log(`  ... and ${duplicates.length - 15} more`);
  }

  // 2. Check if content starts with the title
  let titleInContent = 0;
  const samples: string[] = [];
  for (const a of articles) {
    if (a.contentEn && a.titleEn) {
      const trimmed = a.contentEn.trim();
      if (trimmed.startsWith('# ' + a.titleEn) || trimmed.startsWith('## ' + a.titleEn)) {
        titleInContent++;
        if (samples.length < 5) {
          samples.push(`Title: ${a.titleEn}\nSource: ${a.sourceSite}\nContent start: ${trimmed.substring(0, 100)}\n`);
        }
      }
    }
  }
  console.log(`\n=== Title in content: ${titleInContent} / ${articles.length} ===`);
  if (samples.length > 0) {
    console.log('\nSamples:');
    samples.forEach((s, i) => console.log(`--- Sample ${i + 1} ---\n${s}`));
  }
}

main().catch(console.error);
