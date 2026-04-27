#!/usr/bin/env node
/**
 * Delete the specific dirty article: "Open Source Bible School LMS"
 * This article was raw GitHub README content, not a proper KB article.
 *
 * Usage: npx tsx scripts/delete-dirty-article.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  console.log('🗑️  Looking for dirty article...');

  // Find the article by title pattern
  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, sourceSite, status, isPublished')
    .ilike('titleEn', '%bible school%');

  if (error) {
    console.error(`❌ Query failed: ${error.message}`);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No dirty article found (already deleted?).');
    return;
  }

  for (const article of articles) {
    console.log(`\n📄 Found: "${article.titleEn}"`);
    console.log(`   slug: ${article.slug}`);
    console.log(`   sourceSite: ${article.sourceSite || 'unknown'}`);
    console.log(`   content length: ${article.contentEn?.length || 0} chars`);

    // Show first 200 chars to confirm it's the right one
    const preview = (article.contentEn || '').substring(0, 200);
    console.log(`   preview: ${preview}...`);

    // Delete translations first
    const { error: transError } = await supabase
      .from('ArticleTranslation')
      .delete()
      .eq('articleId', article.id);

    if (transError) {
      console.error(`   ⚠️  Failed to delete translations: ${transError.message}`);
    } else {
      console.log(`   ✅ Deleted translations`);
    }

    // Delete the article
    const { error: deleteError } = await supabase
      .from('Article')
      .delete()
      .eq('id', article.id);

    if (deleteError) {
      console.error(`   ❌ Failed to delete article: ${deleteError.message}`);
    } else {
      console.log(`   ✅ Deleted article "${article.slug}"`);
    }
  }

  console.log('\n✅ Done.');
}

main().catch(console.error);
