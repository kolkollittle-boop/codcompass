#!/usr/bin/env node
/**
 * RSS Feed Article Crawler
 *
 * Fetches articles from RSS/Atom feeds, extracts content from linked URLs,
 * and writes them to the database via the article-writer pipeline.
 *
 * Usage:
 *   npx tsx scripts/crawl-rss.ts
 *   npx tsx scripts/crawl-rss.ts --feed https://hnrss.org/newest?points=50
 *   npx tsx scripts/crawl-rss.ts --config scripts/rss-feeds.json
 *   npx tsx scripts/crawl-rss.ts --dry-run
 *
 * Supports both RSS 2.0 and Atom 1.0 feeds.
 */

import * as https from 'https';
import * as http from 'http';
import { load } from 'cheerio';
import { writeArticle, ArticleInput } from '../lib/article-writer';
import { extractArticleFromUrl } from '../lib/content-extractor';
import { cleanHtmlSecurity, cleanMarkdownArtifacts } from '../lib/content-validator';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  content: string;  // Full content if available
  pubDate: string;
  author: string;
  categories: string[];
}

interface FeedConfig {
  url: string;
  name: string;
  category?: string;
  maxItems?: number;
}

interface CrawlerOptions {
  feeds: FeedConfig[];
  limit?: number;
  dryRun?: boolean;
}

// ── Default Feed Configs ──────────────────────────────────────────────────

const DEFAULT_FEEDS: FeedConfig[] = [
  {
    url: 'https://hnrss.org/newest?points=50&count=20',
    name: 'Hacker News RSS',
    category: 'ai-llm',
    maxItems: 10,
  },
  {
    url: 'https://dev.to/feed',
    name: 'Dev.to RSS',
    category: 'frontend',
    maxItems: 10,
  },
  {
    url: 'https://blog.openai.com/rss/',
    name: 'OpenAI Blog',
    category: 'ai-llm',
    maxItems: 5,
  },
  {
    url: 'https://nextjs.org/blog/rss.xml',
    name: 'Next.js Blog',
    category: 'frontend',
    maxItems: 5,
  },
];

// ── RSS Parser ────────────────────────────────────────────────────────────

async function fetchFeed(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    lib.get(url, { headers: { 'User-Agent': 'CyberpunkWebBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRSS(xml: string): RSSItem[] {
  const $ = load(xml, { xmlMode: true });
  const items: RSSItem[] = [];

  // RSS 2.0
  $('item').each((_, el) => {
    const $el = $(el);
    items.push({
      title: $el.find('title').text().trim(),
      link: $el.find('link').text().trim(),
      description: $el.find('description').text().trim(),
      content: $el.find('content\\:encoded, encoded').text().trim(),
      pubDate: $el.find('pubDate').text().trim(),
      author: $el.find('author, dc\\:creator').text().trim(),
      categories: $el.find('category').map((_, catEl) => $(catEl).text().trim()).get(),
    });
  });

  // Atom 1.0
  if (items.length === 0) {
    $('entry').each((_, el) => {
      const $el = $(el);
      items.push({
        title: $el.find('title').text().trim(),
        link: $el.find('link[rel="alternate"], link:not([rel])').attr('href') || '',
        description: $el.find('summary').text().trim(),
        content: $el.find('content').text().trim(),
        pubDate: $el.find('updated, published').text().trim(),
        author: $el.find('author name').text().trim(),
        categories: $el.find('category').map((_, catEl) => $(catEl).attr('term') || '').get().filter(Boolean),
      });
    });
  }

  return items;
}

// ── Article Conversion ────────────────────────────────────────────────────

async function convertRSSItem(item: RSSItem, feedConfig: FeedConfig): Promise<ArticleInput> {
  let content = item.content;
  let excerpt = item.description;

  // If feed only provides excerpt, fetch full content
  if (!content || content.length < 500) {
    try {
      const extracted = await extractArticleFromUrl(item.link);
      content = extracted.content;
      if (!excerpt || excerpt.length < 50) {
        excerpt = extracted.excerpt;
      }
    } catch {
      // If extraction fails, use description as content
      content = `<p>${item.description}</p><p><a href="${item.link}">Read full article</a></p>`;
    }
  }

  // Clean content
  content = cleanHtmlSecurity(content);
  content = cleanMarkdownArtifacts(content);

  return {
    titleEn: item.title,
    contentEn: content,
    excerptEn: excerpt,
    originalUrl: item.link,
    sourceSite: 'rss-feed',
    sourceAuthor: item.author || feedConfig.name,
    publishedDate: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    tags: item.categories,
    categorySlug: item.categories.length > 0 ? null : feedConfig.category || null,
    isPremium: false,
    isPublished: true,
  };
}

// ── Main Crawler ──────────────────────────────────────────────────────────

async function main() {
  // Parse command line args
  const args = process.argv.slice(2);
  const options: CrawlerOptions = {
    feeds: DEFAULT_FEEDS,
    limit: 20,
    dryRun: false,
  };

  // Check for config file
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      const configPath = args[++i];
      try {
        const config = await import(configPath);
        options.feeds = config.default || config.feeds || [];
      } catch (e) {
        console.error(`❌ Failed to load config from ${configPath}: ${e}`);
        process.exit(1);
      }
    } else if (args[i] === '--feed' && args[i + 1]) {
      // Single feed override
      options.feeds = [{
        url: args[++i],
        name: 'Custom Feed',
        maxItems: 10,
      }];
    } else if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[++i], 10);
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    }
  }

  console.log(`🚀 Starting RSS crawler...`);
  console.log(`   Feeds: ${options.feeds.length}`);
  console.log(`   Limit: ${options.limit}`);
  console.log(`   Dry run: ${options.dryRun}`);
  console.log('');

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalRejected = 0;

  for (const feedConfig of options.feeds) {
    console.log(`📡 Fetching: ${feedConfig.name} (${feedConfig.url})`);

    try {
      const xml = await fetchFeed(feedConfig.url);
      const items = parseRSS(xml);
      console.log(`   📥 Found ${items.length} items\n`);

      const maxItems = feedConfig.maxItems || 10;
      const itemsToProcess = items.slice(0, maxItems);

      for (const item of itemsToProcess) {
        if (totalCreated >= options.limit) break;

        console.log(`   📄 ${item.title}`);

        try {
          if (options.dryRun) {
            console.log(`      [DRY RUN] Would create article`);
            totalSkipped++;
            continue;
          }

          const articleInput = await convertRSSItem(item, feedConfig);

          const result = await writeArticle(articleInput, {
            strict: true,
            autoClean: true,
            autoCategorize: true,
          });

          if (result.success) {
            console.log(`      ✅ Created: ${result.slug}`);
            totalCreated++;
          } else {
            console.log(`      ${result.errors.includes('Article already exists') ? '⏭️  Skipped' : '🚫 Rejected'}: ${result.errors.join('; ')}`);
            if (result.errors.includes('Article already exists')) {
              totalSkipped++;
            } else {
              totalRejected++;
            }
          }
        } catch (error: any) {
          console.log(`      ❌ Error: ${error.message}`);
          totalRejected++;
        }

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      console.log(`   ❌ Failed to fetch feed: ${error.message}\n`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ RSS crawl complete!`);
  console.log(`   Created:  ${totalCreated}`);
  console.log(`   Skipped:  ${totalSkipped}`);
  console.log(`   Rejected: ${totalRejected}`);
  console.log(`   Total:    ${totalCreated + totalSkipped + totalRejected}`);
}

main().catch(console.error);
