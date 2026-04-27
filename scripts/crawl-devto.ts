#!/usr/bin/env node
/**
 * Dev.to Article Crawler
 *
 * Fetches articles from Dev.to using their public API, processes them,
 * and writes them to the database via the article-writer pipeline.
 *
 * Usage:
 *   npx tsx scripts/crawl-devto.ts
 *   npx tsx scripts/crawl-devto.ts --tag typescript --limit 10
 *   npx tsx scripts/crawl-devto.ts --tag react --top --limit 5
 *
 * Dev.to API docs: https://developers.forem.com/api
 */

import * as https from 'https';
import * as http from 'http';
import { writeArticle, ArticleInput } from '../lib/article-writer';
import { CATEGORIES, CategoryInfo } from '../lib/categories';
import { generateSlug } from '../lib/content-extractor';
import { cleanHtmlSecurity } from '../lib/content-validator';

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  page_views_count: number;
  published_at: string;
  edited_at: string | null;
  crossposted_at: string | null;
  created_at: string;
  tag_list: string[];
  tags: string;
  body_html: string;
  user: {
    name: string;
    username: string;
    profile_image: string;
  };
  organization: {
    name: string;
    username: string;
    slug: string;
  } | null;
}

interface CrawlerOptions {
  tag?: string;
  limit?: number;
  top?: boolean;
  latest?: boolean;
  dryRun?: boolean;
}

// ── Dev.to API Client ─────────────────────────────────────────────────────

async function fetchDevToArticles(options: CrawlerOptions): Promise<DevToArticle[]> {
  const { tag, limit = 10, top = false, latest = false } = options;

  let url = 'https://dev.to/api/articles?';
  const params: string[] = [];

  if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
  params.push(`per_page=${Math.min(limit, 1000)}`); // Max 1000 per page

  if (top) {
    url += 'top=';
  } else if (latest) {
    url += 'latest=';
  } else {
    url += 'rising=';
  }

  url += 'true&' + params.join('&');

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const articles: DevToArticle[] = JSON.parse(data);
          resolve(articles.slice(0, limit));
        } catch (e) {
          reject(new Error(`Failed to parse Dev.to API response: ${e}`));
        }
      });
    }).on('error', reject);
  });
}

// ── Article Conversion ────────────────────────────────────────────────────

function convertDevToArticle(devto: DevToArticle): ArticleInput {
  // Clean HTML content
  let content = devto.body_html || '';
  content = cleanHtmlSecurity(content);

  // Generate excerpt from description or content
  const excerpt = devto.description || extractTextExcerpt(content, 200);

  // Map Dev.to tags to our categories
  const categorySlug = matchCategoryFromTags(devto.tag_list);

  return {
    titleEn: devto.title,
    contentEn: content,
    excerptEn: excerpt,
    originalUrl: devto.url,
    sourceSite: 'devto',
    sourceAuthor: devto.user.name,
    publishedDate: devto.published_at,
    tags: devto.tag_list,
    categorySlug,
    isPremium: false, // Dev.to articles are free
    isPublished: true,
  };
}

function extractTextExcerpt(html: string, maxLength: number): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s\w+$/, '') + '...';
}

function matchCategoryFromTags(tags: string[]): string | null {
  // Map common Dev.to tags to our categories
  const tagMap: Record<string, string> = {
    'react': 'frontend',
    'nextjs': 'frontend',
    'vue': 'frontend',
    'svelte': 'frontend',
    'typescript': 'frontend',
    'javascript': 'frontend',
    'css': 'frontend',
    'tailwindcss': 'frontend',

    'node': 'backend',
    'go': 'backend',
    'rust': 'backend',
    'python': 'backend',
    'express': 'backend',
    'fastapi': 'backend',
    'microservices': 'backend',

    'ai': 'ai-llm',
    'llm': 'ai-llm',
    'machinelearning': 'ai-llm',
    'deeplearning': 'ai-llm',
    'nlp': 'ai-llm',
    'gpt': 'ai-llm',
    'prompt': 'ai-llm',

    'postgres': 'database',
    'postgresql': 'database',
    'redis': 'database',
    'mongodb': 'database',
    'supabase': 'database',
    'sql': 'database',

    'api': 'api',
    'graphql': 'api',
    'trpc': 'api',
    'rest': 'api',

    'docker': 'devops',
    'kubernetes': 'devops',
    'ci': 'devops',
    'cd': 'devops',
    'githubactions': 'devops',
    'aws': 'devops',
    'cloud': 'devops',

    'reactnative': 'mobile',
    'flutter': 'mobile',
    'ios': 'mobile',
    'android': 'mobile',
    'swift': 'mobile',

    'security': 'security',
    'cybersecurity': 'security',
    'authentication': 'security',

    'startup': 'product',
    'saas': 'product',
    'indiehacker': 'product',
    'entrepreneurship': 'product',
    'productivity': 'product',
  };

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (tagMap[lowerTag]) {
      return tagMap[lowerTag];
    }
  }

  // Default to frontend if no match
  return 'frontend';
}

// ── Main Crawler ──────────────────────────────────────────────────────────

async function main() {
  // Parse command line args
  const args = process.argv.slice(2);
  const options: CrawlerOptions = {
    limit: 10,
    top: false,
    latest: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag' && args[i + 1]) {
      options.tag = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[++i], 10);
    } else if (args[i] === '--top') {
      options.top = true;
    } else if (args[i] === '--latest') {
      options.latest = true;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    }
  }

  console.log(`🚀 Starting Dev.to crawler...`);
  console.log(`   Tag: ${options.tag || 'all'}`);
  console.log(`   Limit: ${options.limit}`);
  console.log(`   Sort: ${options.top ? 'top' : options.latest ? 'latest' : 'rising'}`);
  console.log(`   Dry run: ${options.dryRun}`);
  console.log('');

  try {
    // Fetch articles from Dev.to
    const devtoArticles = await fetchDevToArticles(options);
    console.log(`📥 Fetched ${devtoArticles.length} articles from Dev.to\n`);

    let created = 0;
    let skipped = 0;
    let rejected = 0;

    for (const devto of devtoArticles) {
      console.log(`📄 Processing: "${devto.title}"`);

      try {
        // Convert to our format
        const articleInput = convertDevToArticle(devto);

        if (options.dryRun) {
          console.log(`   [DRY RUN] Would create: ${articleInput.titleEn}`);
          console.log(`   Category: ${articleInput.categorySlug}`);
          console.log(`   Tags: ${articleInput.tags?.join(', ') || 'none'}`);
          skipped++;
          continue;
        }

        // Write to database
        const result = await writeArticle(articleInput, {
          strict: true,
          autoClean: true,
          autoCategorize: true,
          categories: CATEGORIES.map((c) => ({
            slug: c.slug,
            name: c.name,
            keywords: c.descriptionEn.toLowerCase().split(/[\s,]+/),
          })),
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

      // Small delay to be nice to the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Dev.to crawl complete!`);
    console.log(`   Created:  ${created}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Total:    ${devtoArticles.length}`);
  } catch (error: any) {
    console.error(`❌ Crawler failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
