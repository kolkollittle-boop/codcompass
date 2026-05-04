#!/usr/bin/env node
/**
 * Upsert Codcompass 2.0 Category rows and remap every Article → primary CC20 section
 * (join table "_ArticleToCategory": A = article id, B = category id).
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npx tsx scripts/remap-articles-cc20-categories.ts
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  CC20_SECTIONS,
  getCc20SectionSlugForArticle,
} from '../lib/cc20-kb-taxonomy';

function uid() {
  return crypto.randomUUID();
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  console.log('📁 Upserting CC20 categories...');
  const categoryIdBySlug = new Map<string, string>();

  for (let i = 0; i < CC20_SECTIONS.length; i++) {
    const sec = CC20_SECTIONS[i];
    const { data: existing } = await supabase
      .from('Category')
      .select('id')
      .eq('slug', sec.slug)
      .maybeSingle();

    const id = existing?.id ?? uid();
    const { error } = await supabase.from('Category').upsert(
      {
        id,
        slug: sec.slug,
        name: sec.name,
        nameEn: sec.name,
        description: sec.descriptionEn,
        order: i + 1,
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`  ❌ ${sec.slug}: ${error.message}`);
      process.exit(1);
    }
    categoryIdBySlug.set(sec.slug, id);
    console.log(`  ✅ ${sec.slug}`);
  }

  console.log('\n📎 Loading articles...');
  const { data: articles, error: artErr } = await supabase
    .from('Article')
    .select('id, slug');

  if (artErr || !articles) {
    console.error(artErr?.message || 'No articles');
    process.exit(1);
  }

  console.log(`   ${articles.length} articles\n🔗 Remapping joins...`);

  let ok = 0;
  let skip = 0;

  for (const row of articles) {
    const slug = row.slug as string;
    const articleId = row.id as string;
    const sectionSlug = getCc20SectionSlugForArticle(slug);
    const catId = categoryIdBySlug.get(sectionSlug);

    if (!catId) {
      console.warn(`  ⚠️  Unknown section "${sectionSlug}" for ${slug}, skip`);
      skip++;
      continue;
    }

    const { error: delErr } = await supabase.from('_ArticleToCategory').delete().eq('A', articleId);
    if (delErr) {
      console.error(`  ❌ delete joins ${slug}: ${delErr.message}`);
      skip++;
      continue;
    }

    const { error: insErr } = await supabase.from('_ArticleToCategory').insert({ A: articleId, B: catId });
    if (insErr) {
      console.error(`  ❌ insert join ${slug}: ${insErr.message}`);
      skip++;
      continue;
    }

    ok++;
    if (ok % 10 === 0) process.stdout.write('.');
  }

  console.log(`\n\n✅ Remapped ${ok} articles (${skip} skipped/errors).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
