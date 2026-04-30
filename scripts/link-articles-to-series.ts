/**
 * Script to link articles to their corresponding series based on slug patterns
 * Run with: npx tsx -r dotenv/config scripts/link-articles-to-series.ts
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Series slug to keyword mapping
const SERIES_KEYWORDS: Record<string, string[]> = {
  'rag-architecture-advanced': ['rag', 'retrieval', 'embedding', 'vector', 'hybrid search', 'rerank', 'chunking'],
  'ai-agent-development': ['agent', 'multi-agent', 'autonomous', 'tool use', 'planning', 'copilot'],
  'microservices-architecture': ['microservice', 'service mesh', 'api gateway', 'kubernetes', 'docker', 'deployment'],
  'fullstack-performance': ['performance', 'optimization', 'caching', 'cdn', 'database', 'scaling'],
};

async function linkArticlesToSeries() {
  console.log('Starting article-series linking...\n');

  // Get all series
  const { data: seriesList } = await supabaseAdmin
    .from('ArticleSeries')
    .select('id, slug');

  if (!seriesList || seriesList.length === 0) {
    console.log('No series found');
    return;
  }

  console.log(`Found ${seriesList.length} series\n`);

  // Get all articles without seriesId
  const { data: articles } = await supabaseAdmin
    .from('Article')
    .select('id, slug, "titleEn", "content"')
    .is('seriesId', null)
    .eq('isPublished', true);

  if (!articles || articles.length === 0) {
    console.log('No articles without seriesId found');
    return;
  }

  console.log(`Found ${articles.length} articles without seriesId\n`);

  let linkedCount = 0;

  for (const article of articles) {
    const textToMatch = `${article.title || ''} ${article.titleEn || ''} ${article.slug || ''}`.toLowerCase();
    
    // Find matching series based on keywords
    let matchedSeries: string | null = null;
    
    for (const [slug, keywords] of Object.entries(SERIES_KEYWORDS)) {
      const hasKeyword = keywords.some(kw => textToMatch.includes(kw.toLowerCase()));
      if (hasKeyword) {
        matchedSeries = slug;
        break;
      }
    }

    if (matchedSeries) {
      const series = seriesList.find(s => s.slug === matchedSeries);
      if (series) {
        const { error } = await supabaseAdmin
          .from('Article')
          .update({ seriesId: series.id })
          .eq('id', article.id);

        if (error) {
          console.log(`  ERROR linking "${article.slug}" to ${matchedSeries}: ${error.message}`);
        } else {
          console.log(`  ✓ Linked "${article.slug}" -> ${matchedSeries}`);
          linkedCount++;
        }
      }
    } else {
      console.log(`  - No match for "${article.slug}"`);
    }
  }

  console.log(`\nDone! Linked ${linkedCount} articles to series`);

  // Verify results
  for (const series of seriesList) {
    const { count } = await supabaseAdmin
      .from('Article')
      .select('*', { count: 'exact', head: true })
      .eq('seriesId', series.id);

    console.log(`  ${series.slug}: ${count} articles`);
  }
}

linkArticlesToSeries().catch(console.error);
