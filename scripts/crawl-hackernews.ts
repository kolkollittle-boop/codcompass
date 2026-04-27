#!/usr/bin/env node
/**
 * HackerNews Article Crawler
 *
 * Fetches top stories from HackerNews, extracts content from linked URLs,
 * and writes them to the database via the article-writer pipeline.
 *
 * Usage:
 *   npx tsx scripts/crawl-hackernews.ts
 *   npx tsx scripts/crawl-hackernews.ts --limit 5 --min-score 50
 *   npx tsx scripts/crawl-hackernews.ts --dry-run
 *
 * HN API docs: https://github.com/HackerNews/API
 */

import * as https from 'https';
import { writeArticle, ArticleInput } from '../lib/article-writer';
import { extractArticleFromUrl } from '../lib/content-extractor';
import { cleanHtmlSecurity } from '../lib/content-validator';

interface HNStory {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  score: number;
  time: number;
  descendants: number;
  type: 'story' | 'job' | 'poll' | 'pollopt' | 'comment';
}

interface CrawlerOptions {
  limit?: number;
  minScore?: number;
  dryRun?: boolean;
}

// ── HackerNews API Client ─────────────────────────────────────────────────

async function fetchTopStoryIds(): Promise<number[]> {
  return new Promise((resolve, reject) => {
    https.get('https://hacker-news.firebaseio.com/v0/topstories.json', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const ids: number[] = JSON.parse(data);
          resolve(ids);
        } catch (e) {
          reject(new Error(`Failed to parse HN top stories: ${e}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchStory(id: number): Promise<HNStory | null> {
  return new Promise((resolve, reject) => {
    https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const story: HNStory = JSON.parse(data);
          resolve(story);
        } catch {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

// ── Main Crawler ──────────────────────────────────────────────────────────

async function main() {
  // Parse command line args
  const args = process.argv.slice(2);
  const options: CrawlerOptions = {
    limit: 10,
    minScore: 30,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[++i], 10);
    } else if (args[i] === '--min-score' && args[i + 1]) {
      options.minScore = parseInt(args[++i], 10);
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    }
  }

  console.log(`🚀 Starting HackerNews crawler...`);
  console.log(`   Limit: ${options.limit}`);
  console.log(`   Min score: ${options.minScore}`);
  console.log(`   Dry run: ${options.dryRun}`);
  console.log('');

  try {
    // Get top story IDs
    const storyIds = await fetchTopStoryIds();
    console.log(`📥 Found ${storyIds.length} top stories\n`);

    let created = 0;
    let skipped = 0;
    let rejected = 0;
    let noUrl = 0;

    // Process stories until we hit the limit
    for (let i = 0; i < storyIds.length && created < options.limit; i++) {
      const storyId = storyIds[i];

      const story = await fetchStory(storyId);
      if (!story || story.type !== 'story') continue;

      // Skip self posts (Ask HN, Show HN without external URL)
      if (!story.url) {
        noUrl++;
        continue;
      }

      // Skip low-score stories
      if (story.score < options.minScore) {
        continue;
      }

      console.log(`📄 [${story.score} pts] ${story.title}`);

      try {
        if (options.dryRun) {
          console.log(`   [DRY RUN] Would fetch: ${story.url}`);
          skipped++;
          continue;
        }

        // Extract content from the linked URL
        console.log(`   🔍 Fetching content from: ${story.url}`);
        const extracted = await extractArticleFromUrl(story.url);

        // Use extracted title if it's better, otherwise use HN title
        const title = extracted.title && extracted.title.length > 5
          ? extracted.title
          : story.title;

        // Clean content
        let content = extracted.content;
        content = cleanHtmlSecurity(content);

        // Build article input
        const articleInput: ArticleInput = {
          titleEn: title,
          contentEn: content,
          excerptEn: extracted.excerpt,
          originalUrl: story.url,
          sourceSite: 'hackernews',
          sourceAuthor: `HN: ${story.by}`,
          publishedDate: new Date(story.time * 1000).toISOString(),
          tags: [`hackernews`, `score-${story.score}`],
          isPremium: false,
          isPublished: true,
        };

        // Write to database
        const result = await writeArticle(articleInput, {
          strict: true,
          autoClean: true,
          autoCategorize: true,
        });

        if (result.success) {
          console.log(`   ✅ Created: ${result.slug}`);
          if (result.warnings.length > 0) {
            console.log(`   ⚠️  ${result.warnings.join('; ')}`);
          }
          created++;
        } else {
          console.log(`   ${result.errors.includes('Article already exists') ? '⏭️  Skipped' : '🚫 Rejected'}: ${result.errors.join('; ')}`);
          if (result.errors.includes('Article already exists')) {
            skipped++;
          } else {
            rejected++;
          }
        }
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
        rejected++;
      }

      // Small delay to be nice to target servers
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ HackerNews crawl complete!`);
    console.log(`   Created:      ${created}`);
    console.log(`   Skipped:      ${skipped}`);
    console.log(`   Rejected:     ${rejected}`);
    console.log(`   No URL:       ${noUrl}`);
    console.log(`   Processed:    ${created + skipped + rejected}`);
  } catch (error: any) {
    console.error(`❌ Crawler failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
