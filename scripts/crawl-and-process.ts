#!/usr/bin/env node
/**
 * Unified Crawler Orchestrator
 *
 * Runs one or more content crawlers to populate the Knowledge Base.
 * Each crawler extracts content, validates it, and writes clean HTML to the database.
 *
 * Usage:
 *   npx tsx scripts/crawl-and-process.ts                  # Run all crawlers
 *   npx tsx scripts/crawl-and-process.ts --source devto   # Run specific crawler
 *   npx tsx scripts/crawl-and-process.ts --source hn      # Run HackerNews crawler
 *   npx tsx scripts/crawl-and-process.ts --source rss     # Run RSS crawler
 *   npx tsx scripts/crawl-and-process.ts --dry-run        # Dry run mode
 *   npx tsx scripts/crawl-and-process.ts --limit 5        # Limit total articles
 *
 * Available sources: devto, hn, rss
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CrawlerDef {
  name: string;
  script: string;
  description: string;
}

const CRAWLERS: CrawlerDef[] = [
  {
    name: 'devto',
    script: 'scripts/crawl-devto.ts',
    description: 'Dev.to articles (API-based, clean HTML)',
  },
  {
    name: 'hn',
    script: 'scripts/crawl-hackernews.ts',
    description: 'HackerNews top stories (content extraction)',
  },
  {
    name: 'rss',
    script: 'scripts/crawl-rss.ts',
    description: 'RSS/Atom feeds (configurable sources)',
  },
];

async function runCrawler(crawler: CrawlerDef, extraArgs: string[]): Promise<{ success: boolean; output: string }> {
  const cmd = `npx tsx ${crawler.script} ${extraArgs.join(' ')}`;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Running: ${crawler.name} — ${crawler.description}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    console.log(stdout);
    if (stderr) console.error(stderr);
    return { success: true, output: stdout };
  } catch (error: any) {
    console.error(`❌ ${crawler.name} failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return { success: false, output: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let sources: string[] = [];
  let extraArgs: string[] = [];
  let dryRun = false;
  let limit: number | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      sources.push(args[++i]);
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
      extraArgs.push('--limit', limit.toString());
    } else if (args[i] === '--dry-run') {
      dryRun = true;
      extraArgs.push('--dry-run');
    } else {
      extraArgs.push(args[i]);
    }
  }

  // If no sources specified, run all
  if (sources.length === 0) {
    sources = CRAWLERS.map((c) => c.name);
  }

  // Validate sources
  const validSources = CRAWLERS.map((c) => c.name);
  const invalidSources = sources.filter((s) => !validSources.includes(s));
  if (invalidSources.length > 0) {
    console.error(`❌ Unknown sources: ${invalidSources.join(', ')}`);
    console.error(`   Valid sources: ${validSources.join(', ')}`);
    process.exit(1);
  }

  console.log(`📋 Crawler Orchestrator`);
  console.log(`   Sources: ${sources.join(', ')}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Limit: ${limit || 'unlimited'}`);

  // Run crawlers sequentially (to avoid overwhelming the database)
  const results: { name: string; success: boolean }[] = [];

  for (const sourceName of sources) {
    const crawler = CRAWLERS.find((c) => c.name === sourceName)!;
    const result = await runCrawler(crawler, extraArgs);
    results.push({ name: sourceName, success: result.success });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Crawl Summary`);
  console.log(`${'='.repeat(60)}`);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  for (const result of results) {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.name}`);
  }

  console.log(`\n   Total: ${results.length} | Success: ${successCount} | Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
