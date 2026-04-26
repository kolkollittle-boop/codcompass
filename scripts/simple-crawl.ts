#!/usr/bin/env node
/**
 * Deep Content Crawler - Dev.to Focus
 * 
 * Fetches FULL article body from Dev.to, converts HTML to Markdown,
 * and stores it in the database.
 * 
 * Usage: npx tsx scripts/simple-crawl.ts
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import TurndownService from 'turndown';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
});

// Keep code blocks and some formatting clean
td.addRule('remove-scripts', {
  filter: ['script', 'style', 'iframe', 'noscript'],
  replacement: () => ''
});

td.addRule('pre-code', {
  filter: (node) => node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE',
  replacement: (content, node) => {
    const lang = (node.firstChild as HTMLElement).className.replace('language-', '') || '';
    return `\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
  }
});

// --- Category Heuristics ---
function determineCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('ai') || t.includes('ml') || t.includes('llm') || t.includes('machine-learning') || t.includes('gpt') || t.includes('neural')) return 'ai-llm';
  if (t.includes('react') || t.includes('vue') || t.includes('frontend') || t.includes('javascript') || t.includes('typescript') || t.includes('css')) return 'frontend';
  if (t.includes('api') || t.includes('backend') || t.includes('node') || t.includes('go') || t.includes('python') || t.includes('rust') || t.includes('express')) return 'backend';
  if (t.includes('docker') || t.includes('k8s') || t.includes('devops') || t.includes('ci-cd') || t.includes('terraform') || t.includes('aws')) return 'devops';
  if (t.includes('database') || t.includes('sql') || t.includes('postgres') || t.includes('mongo') || t.includes('redis') || t.includes('prisma')) return 'database';
  if (t.includes('security') || t.includes('crypto') || t.includes('web3')) return 'security';
  return 'frontend';
}

// --- Main ---
async function main() {
  console.log('🚀 Starting Deep Dev.to Crawl...');
  
  const now = new Date().toISOString();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  const tags = ['typescript', 'react', 'ai', 'webdev', 'devops', 'database', 'machine-learning', 'rust', 'go', 'python'];
  
  for (const tag of tags) {
    console.log(`\n📝 Fetching tag: ${tag}`);
    try {
      // 1. Get list of articles
      const listRes = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=5&sort_by=public_reactions_count`);
      const articles = await listRes.json();
      
      for (const article of articles) {
        const slug = `devto-${article.slug}`;
        
        // 2. Check DB
        const { data: existing } = await supabase.from('Article').select('id').eq('slug', slug).single();
        if (existing) {
          skipped++;
          continue;
        }
        
        // 3. Fetch FULL details (includes body_html)
        const detailRes = await fetch(`https://dev.to/api/articles/${article.id}`);
        const details = await detailRes.json();
        
        if (!details.body_html) {
          console.log(`   ⚠️ No body for ${article.title}`);
          continue;
        }
        
        // 4. Convert to Markdown
        const markdown = td.turndown(details.body_html);
        
        if (markdown.length < 500) {
          console.log(`   ⚠️ Too short (${markdown.length} chars): ${article.title}`);
          continue;
        }
        
        const tags = Array.isArray(details.tag_list) ? details.tag_list.join(' ') : (details.tags || '');
        const categorySlug = determineCategory(details.title + ' ' + tags);
        
        try {
          const articleId = crypto.randomUUID();
          
          // 5. Insert Article (English)
          const { error: insertError } = await supabase.from('Article').insert({
            id: articleId,
            slug: slug,
            titleEn: details.title,
            contentEn: markdown,
            descriptionEn: details.description || markdown.slice(0, 200) + '...',
            excerptEn: details.description || markdown.slice(0, 200) + '...',
            isPremium: false,
            isPublished: true,
            status: 'PUBLISHED',
            sourceSite: 'Dev.to',
            sourceAuthor: details.user?.name,
            originalUrl: details.url,
            publishedAt: now,
            crawledAt: now,
            createdAt: now,
            updatedAt: now,
          });

          if (insertError) throw insertError;
          
          // 6. Link Category
          const { data: cat } = await supabase.from('Category').select('id').eq('slug', categorySlug).single();
          if (cat) {
            await supabase.from('_ArticleToCategory').insert({ A: articleId, B: cat.id });
          }
          
          // 7. Insert Placeholder Chinese (Copy English for now)
          await supabase.from('ArticleTranslation').insert({
            id: crypto.randomUUID(),
            articleId: articleId,
            locale: 'zh',
            title: details.title, // Keep title as is or mark it
            content: markdown, 
            excerpt: details.description || '',
            isAutoTranslated: false,
            isReviewed: false,
            translatedAt: now,
            updatedAt: now,
          });
          
          created++;
          console.log(`   ✅ [${categorySlug}] ${details.title.slice(0, 50)}... (${markdown.length} chars)`);
          
          // Polite delay
          await new Promise(r => setTimeout(r, 1000));
          
        } catch (e: any) {
          console.error(`   ❌ DB Error: ${e.message}`);
          errors++;
        }
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (e: any) {
      console.error(`   ❌ Tag ${tag} failed: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
