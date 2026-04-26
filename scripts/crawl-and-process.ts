#!/usr/bin/env node
/**
 * Crawl and process content pipeline
 * Fetches content from various sources and processes it
 * Usage: npx tsx scripts/crawl-and-process.ts
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple content processor (without AI)
function processContent(source: string, data: any): {
  title: string;
  content: string;
  excerpt: string;
  category: string;
} {
  // This is a simple processor - in production, you'd use AI
  let title = '';
  let content = '';
  let excerpt = '';
  let category = '';
  
  switch (source) {
    case 'hackernews':
      title = data.title || '';
      excerpt = `A popular discussion on Hacker News with ${data.score} points and ${data.descendants} comments.`;
      content = `<h2>${title}</h2><p>${excerpt}</p><p>Source: <a href="${data.url}">${data.url}</a></p>`;
      category = 'ai-llm'; // Default category
      break;
      
    case 'reddit':
      title = data.title || '';
      excerpt = `A popular post on r/${data.subreddit} with ${data.score} upvotes.`;
      content = `<h2>${title}</h2><p>${excerpt}</p><p>Source: <a href="${data.url}">${data.url}</a></p>`;
      category = 'frontend'; // Default category
      break;
      
    case 'devto':
      title = data.title || '';
      excerpt = data.description || '';
      content = `<h2>${title}</h2><p>${excerpt}</p><p>Source: <a href="${data.url}">${data.url}</a></p>`;
      category = 'frontend'; // Default category
      break;
      
    default:
      title = 'Unknown';
      excerpt = '';
      content = '';
      category = 'frontend';
  }
  
  return { title, content, excerpt, category };
}

async function main() {
  console.log('🚀 Starting crawl and process pipeline...');
  
  // For now, just create some sample content
  const sampleArticles = [
    {
      slug: 'react-19-new-features',
      titleEn: 'React 19: New Features Every Developer Should Know',
      contentEn: '<h2>React 19: The Next Generation</h2><p>React 19 brings significant improvements to developer experience and runtime performance.</p><h3>Server Components by Default</h3><p>Components run on the server unless marked with <code>use client</code>.</p><h3>use() Hook</h3><p>Read promises or context directly:</p><pre><code>import { use } from \'react\';\nfunction UserProfile({ userId }) {\n  const user = use(fetchUser(userId));\n  return <div>{user.name}</div>;\n}</code></pre>',
      excerptEn: 'React 19 features: Server Components, Actions, use() hook, and performance improvements.',
      isPremium: false,
      categorySlug: 'frontend',
    },
    {
      slug: 'typescript-5-new-features',
      titleEn: 'TypeScript 5: New Features and Improvements',
      contentEn: '<h2>TypeScript 5: What\'s New</h2><p>TypeScript 5 brings decorators, const type parameters, and performance improvements.</p><h3>Decorators</h3><p>Stage 3 TC39 decorators are now supported for classes and methods.</p><h3>Const Type Parameters</h3><p>Infer more specific types in generics with const type parameters.</p>',
      excerptEn: 'TypeScript 5: decorators, const type parameters, and performance improvements.',
      isPremium: false,
      categorySlug: 'frontend',
    },
  ];
  
  let created = 0;
  
  for (const article of sampleArticles) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('Article')
        .select('id')
        .eq('slug', article.slug)
        .single();
      
      if (existing) {
        console.log(`⏭️  Skipped: ${article.slug} (already exists)`);
        continue;
      }
      
      // Create article
      const now = new Date().toISOString();
      const { data: newArticle, error: createError } = await supabase
        .from('Article')
        .insert({
          id: crypto.randomUUID(),
          slug: article.slug,
          titleEn: article.titleEn,
          contentEn: article.contentEn,
          excerptEn: article.excerptEn,
          isPremium: article.isPremium,
          isPublished: true,
          status: 'PUBLISHED',
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error(`❌ Failed to create ${article.slug}:`, createError.message);
        continue;
      }
      
      // Link to category
      const { data: category } = await supabase
        .from('Category')
        .select('id')
        .eq('slug', article.categorySlug)
        .single();
      
      if (category) {
        await supabase
          .from('_ArticleToCategory')
          .insert({ A: newArticle.id, B: category.id });
      }
      
      // Create Chinese translation placeholder
      const translationNow = new Date().toISOString();
      await supabase
        .from('ArticleTranslation')
        .insert({
          id: crypto.randomUUID(),
          articleId: newArticle.id,
          locale: 'zh',
          title: article.titleEn, // Keep English for now
          content: article.contentEn, // Keep English for now
          excerpt: article.excerptEn,
          isAutoTranslated: true,
          isReviewed: false,
          translatedAt: translationNow,
          updatedAt: translationNow,
        });
      
      created++;
      console.log(`✅ Created: ${article.slug}`);
      
    } catch (error: any) {
      console.error(`❌ Error creating ${article.slug}:`, error.message);
    }
  }
  
  console.log(`\n✅ Done! Created ${created} articles`);
}

main().catch(console.error);
