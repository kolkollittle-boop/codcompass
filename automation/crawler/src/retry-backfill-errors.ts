#!/usr/bin/env tsx
import { ingestArticle } from './ingest';
import { openCrawlerDb, updateSyncLogStatus } from './local-sqlite';
import { rewriteMarkdownImagesToR2 } from './rewrite-r2-images';
import { enableHttpProxyFromEnv, initProxyPoolOnce, getProxyPoolStatus } from './proxy-env';

type SyncLogRow = {
  id: number;
  task_id: string;
  processed_content: string;
  classification_json: string | null;
  score: number | null;
};

function stripNonAscii(s: string): string {
  return s.replace(/[^\x00-\x7F]/g, '').trim();
}

function extractTitle(md: string): string {
  const match = md.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  const lines = md.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) return lines[0].trim().slice(0, 100);
  return 'Technical Article';
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔄 Retrying BACKFILL_ERROR articles (score >= 60)...\n');

  initProxyPoolOnce();
  await enableHttpProxyFromEnv();

  const proxyStatus = getProxyPoolStatus();
  if (proxyStatus.total > 0) {
    console.log(`[代理池] ${proxyStatus.healthy}/${proxyStatus.total} available`);
  }

  const db = openCrawlerDb();

  const records = db.prepare(`
    SELECT id, task_id, processed_content, classification_json, score
    FROM sync_logs
    WHERE sync_status = 'BACKFILL_ERROR'
      AND score IS NOT NULL
      AND score >= 60
    ORDER BY score DESC
  `).all() as SyncLogRow[];

  console.log(`📊 Found ${records.length} articles to retry\n`);

  if (records.length === 0) {
    console.log('✅ Nothing to retry.');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const score = rec.score || 0;
    const isFeatured = score >= 80;
    const md = rec.processed_content || '';

    if (md.length < 100) { continue; }

    const title = extractTitle(md);

    let articleType = 'KB';
    let kbSectionSlug: string | undefined;
    let blogCategorySlug: string | undefined;
    let mentorSummary = '';

    if (rec.classification_json) {
      try {
        const parsed = JSON.parse(rec.classification_json);
        if (parsed.route) {
          articleType = parsed.route.type || 'KB';
          kbSectionSlug = parsed.route.kb_section_slug || undefined;
          blogCategorySlug = parsed.route.blog_category_slug || undefined;
        }
        if (parsed.mentor_summary) mentorSummary = parsed.mentor_summary;
      } catch { /* ignore */ }
    }

    if (!kbSectionSlug && articleType === 'KB') kbSectionSlug = 'cc20-archive';
    if (!blogCategorySlug && articleType === 'BLOG') blogCategorySlug = 'typescript';

    let contentMd = md;
    try {
      const result = await rewriteMarkdownImagesToR2(md, rec.task_id);
      if (result?.markdown) contentMd = result.markdown;
    } catch { /* keep original */ }

    const isBlog = articleType === 'BLOG';
    const excerpt = stripNonAscii(md.substring(0, 200).replace(/[#*`]/g, '').trim());

    const payload = {
      title,
      content: contentMd,
      sourceUrl: isBlog ? 'https://dev.to' : '',
      score,
      dimensions: {},
      difficulty_level: 'L2',
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
      routingReasoning: 'backfill retry',
      routerKeywords: [],
      is_featured: isFeatured,
    };

    try {
      const res = await ingestArticle(payload);
      const remoteId = res?.data?.[0]?.id ?? res?.id ?? res?.slug ?? 'ok';
      updateSyncLogStatus(db, rec.id, 'BACKFILLED', `Retry OK. id: ${remoteId}`);
      successCount++;
      console.log(`[${i + 1}/${records.length}] ✅ score=${score}`);
    } catch (err: unknown) {
      failCount++;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[${i + 1}/${records.length}] ❌ ${msg.slice(0, 100)}`);
    }

    if (i < records.length - 1) await sleep(3000);
  }

  console.log(`\n🎉 Retry complete: ✅ ${successCount}  ❌ ${failCount}  out of ${records.length}`);
  db.close();
}

main().catch(console.error);
