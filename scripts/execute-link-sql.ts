/**
 * Execute SQL to link articles to series
 * Run with: npx tsx -r dotenv/config scripts/execute-link-sql.ts
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeLinkSQL() {
  console.log('Executing SQL to link articles to series...\n');

  // Series mappings
  const mappings = [
    {
      seriesId: 'rag-architecture-advanced-001',
      slug: 'rag-architecture-advanced',
      keywords: ['rag', 'retrieval', 'embedding', 'vector', 'hybrid search', 'rerank', 'chunking']
    },
    {
      seriesId: '04f143c4-0f3f-4cd2-926b-03ad4ab44871',
      slug: 'ai-agent-development',
      keywords: ['agent', 'multi-agent', 'autonomous', 'tool use', 'planning', 'copilot']
    },
    {
      seriesId: '477039e2-3917-4bb7-b8ed-5e5712b340a0',
      slug: 'microservices-architecture',
      keywords: ['microservice', 'service mesh', 'api gateway', 'kubernetes', 'docker', 'deployment']
    },
    {
      seriesId: '8bec124a-71aa-47a8-a935-7f089eccdf27',
      slug: 'fullstack-performance',
      keywords: ['performance', 'optimization', 'caching', 'cdn', 'scaling']
    }
  ];

  for (const mapping of mappings) {
    // Get all published文章 without seriesId
    const { data: articles, error: fetchError } = await supabaseAdmin
      .from('Article')
      .select('id, slug, "titleEn"')
      .is('seriesId', null)
      .eq('isPublished', true);

    if (fetchError) {
      console.log(`Error fetching articles: ${fetchError.message}`);
      continue;
    }

    // Filter articles that match keywords
    const matchedArticles = (articles || []).filter(a => {
      const textToMatch = `${a.slug || ''} ${a.titleEn || ''}`.toLowerCase();
      return mapping.keywords.some(kw => textToMatch.includes(kw.toLowerCase()));
    });

    if (matchedArticles.length > 0) {
      // Update each article
      for (const article of matchedArticles) {
        const { error: updateError } = await supabaseAdmin
          .from('Article')
          .update({ seriesId: mapping.seriesId })
          .eq('id', article.id);

        if (updateError) {
          console.log(`  ERROR updating "${article.slug}": ${updateError.message}`);
        } else {
          console.log(`  ✓ Linked "${article.slug}" -> ${mapping.slug}`);
        }
      }
    } else {
      console.log(`  - No matching articles for ${mapping.slug}`);
    }
  }

  // Verify results
  console.log('\n--- Verification ---');
  for (const mapping of mappings) {
    const { count } = await supabaseAdmin
      .from('Article')
      .select('*', { count: 'exact', head: true })
      .eq('seriesId', mapping.seriesId)
      .eq('isPublished', true);

    console.log(`  ${mapping.slug}: ${count} articles`);
  }

  console.log('\nDone!');
}

executeLinkSQL().catch(console.error);
