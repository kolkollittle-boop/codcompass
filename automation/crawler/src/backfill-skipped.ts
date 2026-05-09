#!/usr/bin/env tsx
/**
 * Backfill script to reprocess SKIPPED articles with score >= 60
 * Usage: npx tsx src/backfill-skipped.ts
 *
 * Strategy: Use existing classification_json, skip AI routing calls.
 * Add delays between requests to avoid rate limiting.
 */

import { ingestArticle } from './ingest';
import { openCrawlerDb, updateSyncLogStatus } from './local-sqlite';
import { rewriteMarkdownImagesToR2 } from './rewrite-r2-images';
import { enableHttpProxyFromEnv, initProxyPoolOnce, getProxyPoolStatus } from './proxy-env';

type SyncLogRow = {
  id: number;
  task_id: string;
  processed_content: string;
  classification_json: string | null;
  simhash: string | null;
  sync_status: string;
  remote_id: string | null;
  score: number | null;
  note: string | null;
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractTitle(md: string): string {
  const match = md.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  const lines = md.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) return lines[0].trim().slice(0, 100);
  return 'Technical Article';
}

async function main() {
  console.log('🔄 Starting backfill of skipped articles (score >= 60)...');
  console.log('Strategy: reuse classification_json, skip AI routing\n');

  initProxyPoolOnce();
  await enableHttpProxyFromEnv();

  const proxyStatus = getProxyPoolStatus();
  if (proxyStatus.total > 0) {
    console.log(`[代理池] ${proxyStatus.healthy}/${proxyStatus.total} available`);
  }

  const db = openCrawlerDb();

  const skippedRecords = db.prepare(`
    SELECT id, task_id, processed_content, classification_json, score, note
    FROM sync_logs
    WHERE sync_status = 'SKIPPED'
      AND score IS NOT NULL
      AND score >= 60
    ORDER BY score DESC
  `).all() as SyncLogRow[];

  console.log(`📊 Found ${skippedRecords.length} articles to backfill\n`);

  if (skippedRecords.length === 0) {
    console.log('✅ Nothing to backfill.');
    db.close();
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < skippedRecords.length; i++) {
    const rec = skippedRecords[i];
    const score = rec.score || 0;
    const isFeatured = score >= 80;
    const markdown = rec.processed_content || '';

    if (markdown.length < 100) {
      console.log(`[${i + 1}/${skippedRecords.length}] ⏭ skip (too short)`);
      continue;
    }

    const title = extractTitle(markdown);

    // Parse existing classification (NO AI call!)
    let articleType = 'KB';
    let kbSectionSlug: string | undefined;
    let blogCategorySlug: string | undefined;
    let mentorSummary = '';
    let difficultyLevel = 'L2';

    if (rec.classification_json) {
      try {
        const parsed = JSON.parse(rec.classification_json);
        if (parsed.route) {
          articleType = parsed.route.type || 'KB';
          kbSectionSlug = parsed.route.kb_section_slug || undefined;
          blogCategorySlug = parsed.route.blog_category_slug || undefined;
        }
        if (parsed.evaluation_summary?.difficulty) {
          difficultyLevel = parsed.evaluation_summary.difficulty;
        }
        if (parsed.mentor_summary) {
          mentorSummary = parsed.mentor_summary;
        }
      } catch {
        // ignore parse errors
      }
    }

    if (!kbSectionSlug && articleType === 'KB') kbSectionSlug = 'cc20-archive';
    if (!blogCategorySlug && articleType === 'BLOG') blogCategorySlug = 'typescript';

    console.log(`[${i + 1}/${skippedRecords.length}] ${title.slice(0, 60)}... score=${score} type=${articleType}`);

    // Rewrite images to R2
    let contentMd = markdown;
    try {
      const result = await rewriteMarkdownImagesToR2(markdown, rec.task_id);
      if (result?.markdown) contentMd = result.markdown;
    } catch {
      // keep original
    }

    const isBlog = articleType === 'BLOG';
    const excerpt = markdown.substring(0, 200).replace(/[#*`]/g, '').trim();

    const payload = {
      title,
      content: contentMd,
      sourceUrl: isBlog ? 'https://dev.to' : '',
      score,
      dimensions: {},
      difficulty_level: difficultyLevel,
      is_promotional: false,
      mentor_summary: mentorSummary,
      chinese_preview: '',
      images: [],
      tags: ['backfill'],
      reading_time_minutes: Math.max(1, Math.ceil(contentMd.length / 1000 * 5)),
      expected_outcome: '',
      excerpt,
      articleType,
      kbSectionSlug,
      blogCategorySlug,
      routingConfidence: 1,
      routingReasoning: 'backfill from classification_json',
      routerKeywords: [],
      is_featured: isFeatured,
    };

    try {
      const resJson = await ingestArticle(payload);
      const remoteId = resJson?.data?.[0]?.id ?? resJson?.id ?? resJson?.slug ?? 'ok';
      updateSyncLogStatus(db, rec.id, 'BACKFILLED', `Re-ingested. id: ${remoteId}`);
      successCount++;
      console.log(`  ✅ OK`);
    } catch (err: unknown) {
      failCount++;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ ${msg.slice(0, 150)}`);
      try {
        updateSyncLogStatus(db, rec.id, 'BACKFILL_ERROR', msg.slice(0, 500));
      } catch { /* ignore */ }
    }

    // Rate limit: 3s between requests
    if (i < skippedRecords.length - 1) {
      await sleep(3000);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${skippedRecords.length} | ✅${successCount} ❌${failCount} ---\n`);
    }
  }

  console.log('\n🎉 Backfill completed!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${skippedRecords.length}`);

  db.close();
}

main().catch(console.error);
