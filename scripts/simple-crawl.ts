#!/usr/bin/env node
/**
 * Simple crawler - fetches content and stores in DB
 * Usage: npx tsx scripts/simple-crawl.ts
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fetch from Hacker News
async function crawlHackerNews(limit = 20) {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
  const ids = (await res.json()).slice(0, limit);
  
  const stories = await Promise.all(
    ids.map(async (id: number) => {
      const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return r.json();
    })
  );
  
  return stories.filter(s => s && s.url && s.title);
}

// Fetch from Dev.to
async function crawlDevTo(limit = 10) {
  const tags = ['javascript', 'typescript', 'react', 'ai', 'webdev'];
  const allArticles = [];
  
  for (const tag of tags) {
    try {
      const res = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=${limit}&sort_by=public_reactions_count`);
      const articles = await res.json();
      allArticles.push(...articles.slice(0, limit));
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`Dev.to tag ${tag} failed:`, e);
    }
  }
  
  return allArticles;
}

// Simple content generator (no AI needed)
function generateContent(source: string, item: any): {
  titleEn: string;
  contentEn: string;
  excerptEn: string;
  slug: string;
  categorySlug: string;
  isPremium: boolean;
} {
  let titleEn = '';
  let contentEn = '';
  let excerptEn = '';
  let slug = '';
  let categorySlug = 'ai-llm';
  let isPremium = false;
  
  if (source === 'hackernews') {
    titleEn = item.title;
    excerptEn = `A popular discussion on Hacker News with ${item.score || 0} points and ${item.descendants || 0} comments.`;
    
    // Generate a simple article based on the HN story
    contentEn = `<h2>🎯 ${item.title}</h2>
<p>This story is trending on Hacker News with <strong>${item.score || 0} points</strong> and <strong>${item.descendants || 0} comments</strong>. Let's break down what makes it interesting.</p>

<h3>💡 为什么值得关注</h3>
<p>The original article can be found at <a href="${item.url}">${item.url}</a>. The community discussion reveals several key insights that every developer should know about.</p>

<h3>🔧 技术要点</h3>
<ul>
<li><strong>Original discussion:</strong> ${item.by || 'Anonymous'} started the conversation</li>
<li><strong>Community engagement:</strong> ${item.descendants || 0} comments show strong interest</li>
<li><strong>Score:</strong> ${item.score || 0} points indicates quality content</li>
</ul>

<h3>⚠️ 关键思考</h3>
<p>What makes this story stand out is the community's reaction. The high engagement suggests this topic resonates with developers. Here are some angles to consider:</p>
<ul>
<li>How does this affect your daily work?</li>
<li>What are the implications for the broader tech industry?</li>
<li>Are there practical applications you can use today?</li>
</ul>

<h3>🚀 下一步</h3>
<p>Read the <a href="${item.url}">original article</a> and join the <a href="https://news.ycombinator.com/item?id=${item.id}">Hacker News discussion</a> to share your thoughts.</p>`;
    
    slug = item.url
      ? item.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 80).replace(/-+$/, '')
      : `hn-${item.id}`;
    
    // Determine category from URL
    const url = (item.url || '').toLowerCase();
    if (url.includes('ai') || url.includes('ml') || url.includes('llm') || url.includes('chatgpt')) {
      categorySlug = 'ai-llm';
    } else if (url.includes('react') || url.includes('vue') || url.includes('frontend')) {
      categorySlug = 'frontend';
    } else if (url.includes('api') || url.includes('backend') || url.includes('server')) {
      categorySlug = 'backend';
    } else if (url.includes('docker') || url.includes('k8s') || url.includes('devops')) {
      categorySlug = 'devops';
    } else if (url.includes('database') || url.includes('sql') || url.includes('postgres')) {
      categorySlug = 'database';
    } else if (url.includes('security') || url.includes('crypto')) {
      categorySlug = 'security';
    }
    
    isPremium = (item.score || 0) > 100;
    
  } else if (source === 'devto') {
    titleEn = item.title;
    excerptEn = item.description || '';
    contentEn = `<h2>🎯 ${item.title}</h2>
<p>${item.description || 'An interesting article from the developer community.'}</p>

<h3>💡 核心要点</h3>
<p>Written by <strong>${item.user?.name || 'Anonymous'}</strong> on Dev.to, this article has received <strong>${item.positive_reactions_count || 0} reactions</strong> and covers important topics for developers.</p>

<h3>🔧 技术内容</h3>
<p>Tags: ${(item.tag_list || []).join(', ') || 'General'}</p>
<p>Reading time: ~${item.reading_time_minutes || 5} minutes</p>

<h3>⚠️ 值得关注的点</h3>
<p>This article has gained traction in the developer community. Here's why it matters:</p>
<ul>
<li>Practical insights from real-world experience</li>
<li>Code examples you can use in your projects</li>
<li>Community-validated approach</li>
</ul>

<h3>🚀 延伸阅读</h3>
<p>Read the <a href="${item.url}">full article on Dev.to</a> for complete details and code examples.</p>`;
    
    slug = item.slug || `devto-${item.id}`;
    
    // Determine category from tags
    const tags = (item.tag_list || []).join(' ').toLowerCase();
    if (tags.includes('ai') || tags.includes('ml') || tags.includes('llm')) {
      categorySlug = 'ai-llm';
    } else if (tags.includes('react') || tags.includes('vue') || tags.includes('frontend')) {
      categorySlug = 'frontend';
    } else if (tags.includes('api') || tags.includes('backend') || tags.includes('node')) {
      categorySlug = 'backend';
    } else if (tags.includes('docker') || tags.includes('devops') || tags.includes('ci-cd')) {
      categorySlug = 'devops';
    } else if (tags.includes('database') || tags.includes('sql')) {
      categorySlug = 'database';
    } else if (tags.includes('security') || tags.includes('crypto')) {
      categorySlug = 'security';
    }
    
    isPremium = (item.positive_reactions_count || 0) > 50;
  }
  
  return { titleEn, contentEn, excerptEn, slug, categorySlug, isPremium };
}

async function main() {
  console.log('🚀 Starting simple crawl...');
  
  const now = new Date().toISOString();
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  // Crawl Hacker News
  console.log('\n📰 Crawling Hacker News...');
  try {
    const hnStories = await crawlHackerNews(20);
    console.log(`   Found ${hnStories.length} stories`);
    
    for (const story of hnStories) {
      try {
        const content = generateContent('hackernews', story);
        if (!content.slug) continue;
        
        // Check if exists
        const { data: existing } = await supabase
          .from('Article')
          .select('id')
          .eq('slug', content.slug)
          .single();
        
        if (existing) {
          skipped++;
          continue;
        }
        
        const articleId = crypto.randomUUID();
        
        // Insert article
        await supabase.from('Article').insert({
          id: articleId,
          slug: content.slug,
          titleEn: content.titleEn,
          contentEn: content.contentEn,
          excerptEn: content.excerptEn,
          isPremium: content.isPremium,
          isPublished: true,
          status: 'PUBLISHED',
          sourceSite: 'Hacker News',
          sourceAuthor: story.by,
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        });
        
        // Link to category
        const { data: cat } = await supabase
          .from('Category')
          .select('id')
          .eq('slug', content.categorySlug)
          .single();
        
        if (cat) {
          await supabase.from('_ArticleToCategory').insert({
            A: articleId,
            B: cat.id,
          });
        }
        
        // Chinese translation placeholder
        await supabase.from('ArticleTranslation').insert({
          id: crypto.randomUUID(),
          articleId: articleId,
          locale: 'zh',
          title: content.titleEn,
          content: content.contentEn,
          excerpt: content.excerptEn,
          isAutoTranslated: true,
          isReviewed: false,
          translatedAt: now,
          updatedAt: now,
        });
        
        created++;
        console.log(`   ✅ ${content.slug}`);
        
      } catch (e: any) {
        errors++;
        console.error(`   ❌ Error: ${e.message}`);
      }
    }
  } catch (e: any) {
    console.error('   HN crawl failed:', e.message);
  }
  
  // Crawl Dev.to
  console.log('\n📝 Crawling Dev.to...');
  try {
    const devArticles = await crawlDevTo(10);
    console.log(`   Found ${devArticles.length} articles`);
    
    for (const article of devArticles) {
      try {
        const content = generateContent('devto', article);
        if (!content.slug) continue;
        
        // Check if exists
        const { data: existing } = await supabase
          .from('Article')
          .select('id')
          .eq('slug', content.slug)
          .single();
        
        if (existing) {
          skipped++;
          continue;
        }
        
        const articleId = crypto.randomUUID();
        
        // Insert article
        await supabase.from('Article').insert({
          id: articleId,
          slug: content.slug,
          titleEn: content.titleEn,
          contentEn: content.contentEn,
          excerptEn: content.excerptEn,
          isPremium: content.isPremium,
          isPublished: true,
          status: 'PUBLISHED',
          sourceSite: 'Dev.to',
          sourceAuthor: article.user?.name,
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        });
        
        // Link to category
        const { data: cat } = await supabase
          .from('Category')
          .select('id')
          .eq('slug', content.categorySlug)
          .single();
        
        if (cat) {
          await supabase.from('_ArticleToCategory').insert({
            A: articleId,
            B: cat.id,
          });
        }
        
        // Chinese translation placeholder
        await supabase.from('ArticleTranslation').insert({
          id: crypto.randomUUID(),
          articleId: articleId,
          locale: 'zh',
          title: content.titleEn,
          content: content.contentEn,
          excerpt: content.excerptEn,
          isAutoTranslated: true,
          isReviewed: false,
          translatedAt: now,
          updatedAt: now,
        });
        
        created++;
        console.log(`   ✅ ${content.slug}`);
        
      } catch (e: any) {
        errors++;
        console.error(`   ❌ Error: ${e.message}`);
      }
    }
  } catch (e: any) {
    console.error('   Dev.to crawl failed:', e.message);
  }
  
  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
