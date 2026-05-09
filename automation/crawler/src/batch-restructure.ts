#!/usr/bin/env node
/**
 * 批量重构已入库文章（版权安全版）
 *
 * 对所有有来源 URL 的已发布文章调用新的重构逻辑，替换为版权安全的原创内容。
 *
 * Usage:
 *   npx tsx src/batch-restructure.ts
 *   npx tsx src/batch-restructure.ts --limit 5
 *   npx tsx src/batch-restructure.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { restructureArticle } from './article-restructurer';
import { computeSimHash } from './simhash';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '..', '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ArticleToRestructure {
  id: string;
  titleEn: string;
  contentEn: string;
  originalUrl: string;
  qualityDetails: any;
}

async function fetchArticlesToRestructure(limit?: number): Promise<ArticleToRestructure[]> {
  console.log('📥 Fetching published articles with source URLs...');

  let query = supabase
    .from('Article')
    .select('id, titleEn, contentEn, originalUrl, qualityDetails')
    .eq('status', 'PUBLISHED')
    .not('originalUrl', 'is', null)
    .order('updatedAt', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  // Filter out already-restructured articles
  const articles = (data || []).filter((a: any) => {
    const qd = a.qualityDetails;
    return !(qd && typeof qd === 'object' && qd.restructured === true);
  }) as ArticleToRestructure[];

  const alreadyDone = (data || []).length - articles.length;
  if (alreadyDone > 0) {
    console.log(`   ⏭️  ${alreadyDone} articles already restructured, skipped`);
  }

  console.log(`   ✅ Found ${articles.length} articles to restructure`);
  return articles;
}

async function restructureSingleArticle(article: ArticleToRestructure): Promise<{
  success: boolean;
  title: string;
  reason?: string;
}> {
  const title = article.titleEn?.slice(0, 80) || '(untitled)';

  const contentLen = (article.contentEn || '').length;
  if (contentLen < 500) {
    return { success: false, title, reason: `content too short (${contentLen} chars)` };
  }

  if (contentLen < 1000) {
    console.log(`  ⏭️  ${title} — too short, skipping`);
    return { success: false, title, reason: 'too short' };
  }

  try {
    const result = await restructureArticle(
      article.titleEn,
      article.contentEn,
      article.qualityDetails || {}
    );

    if (!result.content || result.content.length < 500) {
      return { success: false, title, reason: 'restructure returned empty/short' };
    }

    const newSimhash = computeSimHash(result.title, result.content);

    const { error: updateError } = await supabase
      .from('Article')
      .update({
        titleEn: result.title,
        contentEn: result.content,
        slug: generateSlug(result.title),
        qualityScore: article.qualityDetails?.score || article.qualityDetails?.aiScore,
        qualityDetails: {
          ...(article.qualityDetails || {}),
          restructured: true,
          restructuredAt: new Date().toISOString(),
          originalTitle: article.titleEn,
          simhash: newSimhash,
        },
        updatedAt: new Date().toISOString(),
      })
      .eq('id', article.id);

    if (updateError) {
      return { success: false, title, reason: updateError.message };
    }

    return { success: true, title: result.title };
  } catch (error: any) {
    return { success: false, title, reason: error.message };
  }
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .trim()
    .substring(0, 60);
  // Add timestamp-based suffix to avoid unique constraint conflicts
  const suffix = Date.now().toString(36).slice(-6);
  return `${base}-${suffix}`;
}

async function main() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let limit: number | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    }
  }

  const articles = await fetchArticlesToRestructure(limit || undefined);

  if (articles.length === 0) {
    console.log('\n✅ No articles need restructuring. All done!');
    return;
  }

  if (dryRun) {
    console.log(`\n🔍 Dry run mode. Would restructure ${articles.length} articles:`);
    for (const a of articles.slice(0, 10)) {
      console.log(`  - ${a.titleEn}`);
    }
    if (articles.length > 10) {
      console.log(`  ... and ${articles.length - 10} more`);
    }
    return;
  }

  console.log(`\n🔄 Starting batch restructure (serial mode to avoid 429)...`);
  console.log(`   Articles: ${articles.length}`);
  console.log(`   Est. time: ~${Math.ceil(articles.length * 4 / 60)} hours`);
  console.log('');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const title = article.titleEn?.slice(0, 80) || '(untitled)';

    console.log(`\n[${i + 1}/${articles.length}] ${title}`);

    const result = await restructureSingleArticle(article);

    if (result.success) {
      console.log(`  ✅ Restructured: "${result.title.slice(0, 60)}..."`);
      successCount++;
    } else {
      console.log(`  ❌ Failed: ${result.reason}`);
      if (result.reason === 'too short' || result.reason?.startsWith('content too short')) {
        skipCount++;
      } else {
        failCount++;
      }
    }

    // Progress
    const elapsed = (Date.now() - startTime) / 1000;
    const processed = i + 1;
    const rate = processed / (elapsed / 60); // articles per minute
    const remaining = articles.length - processed;
    const eta = remaining / rate; // minutes

    console.log(`  📊 Progress: ${processed}/${articles.length} | ✅${successCount} ❌${failCount} ⏭️${skipCount} | ETA: ${Math.ceil(eta)}min`);

    // Delay between articles to avoid rate limiting
    if (i < articles.length - 1) {
      const delay = 5000; // 5s 缓冲
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log('\n' + '='.repeat(60));
  console.log('✅ Batch restructure completed!');
  console.log(`   Total:      ${articles.length}`);
  console.log(`   Success:    ${successCount}`);
  console.log(`   Failed:     ${failCount}`);
  console.log(`   Skipped:    ${skipCount}`);
  console.log(`   Time:       ${Math.floor(totalTime / 60)}m ${Math.floor(totalTime % 60)}s`);
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
