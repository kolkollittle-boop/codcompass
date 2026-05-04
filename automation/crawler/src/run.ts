/**
 * Codcompass 爬虫 2.0 — 对齐 docs「架构重组：本地-云端双轨制」「断点续爬」：
 * - 本地 SQLite：CrawlTasks / RawMaterials / SyncLogs
 * - 可选 HTTP_PROXY（Clash/Surge）
 * - 仅通过 Ingest API 推送；AI ≥80 且未关闭 CRAWLER_PUSH 时才请求线上
 */
import { scoreArticle } from './ai-scorer';
import { ingestArticle } from './ingest';
import { getCrawlerIngestSiteBaseUrl } from './ingest-site-url.js';
import { restructureArticle } from './article-restructurer';
import { routeArticleSemantic } from './semantic-router';
import { computeSimHash } from './simhash';
import {
  type CrawlTaskRow,
  bumpRetry,
  getRawBody,
  insertSyncLog,
  listResolvableTasks,
  markTaskCrawled,
  markTaskStatus,
  openCrawlerDb,
  saveRawMaterial,
  upsertPendingTask,
} from './local-sqlite';
import { enableHttpProxyFromEnv } from './proxy-env';
import { savePendingPush } from './local-store';
import { extractReadabilityContentHtml } from './readability-html';
import { fetchRemoteSimhashList, remoteSimhashConflict } from './simhash-remote';
import { validateRouteAgainstTaxonomy } from './taxonomy-validate';
import { rewriteMarkdownImagesToR2 } from './rewrite-r2-images';
import TurndownService from 'turndown';
import type BetterSqlite3 from 'better-sqlite3';
import { appendCrawlerRunHistory } from './crawler-run-history.js';
import {
  getCrawlerAdvancedForRun,
  getDevtoFetchOptions,
  readCrawlerUiConfig,
  titleMatchesKeywordBlacklist,
} from './crawler-ui-config.js';

const CRAWLER_PUSH = !['false', '0', 'no'].includes(String(process.env.CRAWLER_PUSH ?? 'true').toLowerCase());

type RunCounters = {
  discovered: number;
  processed: number;
  qualified: number;
  kbPushed: number;
  blogPushed: number;
};

function siteLabelFromConfig(): string {
  const c = readCrawlerUiConfig();
  const labels = c.sources
    .filter((s) => s.enabled)
    .map((s) => String(s.label || '').trim())
    .filter(Boolean);
  if (!labels.length) return 'Dev.to';
  const uniq = [...new Set(labels)];
  if (uniq.length <= 3) return uniq.join('、');
  return `${uniq.slice(0, 3).join('、')} 等`;
}

const DEVTO_API_URL = 'https://dev.to/api/articles';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

turndownService.addRule('image', {
  filter: 'img',
  replacement: (_content, node: any) => {
    const alt = node.alt || '';
    const src = node.getAttribute('src');
    return src ? `![${alt}](${src})` : '';
  },
});

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  tags: string[];
  user: { name: string; username: string };
  published_at: string;
  positive_reactions_count: number;
  reading_time_minutes: number;
  body_html?: string;
  body_markdown?: string;
  cover_image?: string;
}

function cleanHtml(html: string): string {
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '');
  html = html.replace(/\s*class="[^"]*"\s*/gi, '');
  return html;
}

function articleToMarkdown(fullArticle: DevToArticle): { markdown: string; images: string[] } {
  const images: string[] = [];
  if (fullArticle.cover_image) images.push(fullArticle.cover_image);

  let markdown = '';
  if (fullArticle.body_html) {
    const readableHtml = extractReadabilityContentHtml(fullArticle.body_html, fullArticle.url);
    const htmlSrc = readableHtml ?? cleanHtml(fullArticle.body_html);
    markdown = turndownService.turndown(htmlSrc);
  } else if (fullArticle.body_markdown) {
    markdown = fullArticle.body_markdown;
  } else {
    markdown = fullArticle.description || '';
  }

  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  while ((match = imgRegex.exec(markdown)) !== null) {
    if (!images.includes(match[1])) images.push(match[1]);
  }
  return { markdown, images };
}

async function fetchArticlesFromDevTo(): Promise<DevToArticle[]> {
  const allArticles: DevToArticle[] = [];
  const { tags, articlesPerTag } = getDevtoFetchOptions();

  for (const tag of tags) {
    console.log(`📚 Fetching articles from Dev.to with tag: ${tag}`);
    const url = `${DEVTO_API_URL}?tag=${encodeURIComponent(tag)}&per_page=${articlesPerTag}&sort_by=public_reactions_count`;
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CodcompassKB/1.0 (educational crawler)',
        },
      });
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch ${tag}: ${response.status}`);
        continue;
      }
      const articles: DevToArticle[] = await response.json();
      console.log(`✅ Got ${articles.length} articles for tag: ${tag}`);
      allArticles.push(...articles);
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error(`❌ Error fetching ${tag}:`, error);
    }
  }

  const seen = new Set<string>();
  return allArticles.filter((article) => {
    if (seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });
}

async function fetchFullArticleJson(articleId: number): Promise<DevToArticle | null> {
  const url = `${DEVTO_API_URL}/${articleId}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'CodcompassKB/1.0 (educational crawler)',
    },
  });
  if (!response.ok) return null;
  return response.json();
}

async function translateToChinese(title: string, content: string): Promise<string> {
  try {
    const MAX_CHUNK_SIZE = 3000;
    if (content.length <= MAX_CHUNK_SIZE) return await translateChunk(title, content);
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += MAX_CHUNK_SIZE) {
      const chunk = content.substring(i, i + MAX_CHUNK_SIZE);
      const isLast = i + MAX_CHUNK_SIZE >= content.length;
      const translated = await translateChunk(isLast ? title : `（续）`, chunk);
      if (translated) chunks.push(translated);
      await new Promise((r) => setTimeout(r, 1000));
    }
    return chunks.join('\n\n---\n\n');
  } catch (error) {
    console.error(`❌ Translation error:`, error);
    return '';
  }
}

async function translateChunk(title: string, content: string): Promise<string> {
  const response = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'system',
          content: `你是一位专业的技术翻译家，擅长将英文技术文章翻译成流畅的中文。
请保持以下要求：
1. 技术术语保持英文（如 React, TypeScript, API 等）
2. 代码块不要翻译
3. 保持 Markdown 格式不变
4. 只翻译文本内容
5. 输出翻译后的中文内容，不要添加额外说明`,
        },
        {
          role: 'user',
          content: `请将以下文章翻译成中文：\n\n标题：${title}\n\n内容：${content}`,
        },
      ],
    }),
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function processDbTask(
  db: BetterSqlite3.Database,
  task: CrawlTaskRow,
  idx: number,
  total: number,
  SCORE_THRESHOLD: number,
  runCounters: RunCounters
): Promise<{ success: boolean; skipped: boolean }> {
  console.log(`\n[${idx + 1}/${total}] task=${task.status} ${task.url}`);

  let fullArticle: DevToArticle;

  try {
    runCounters.processed += 1;

    if (task.status === 'PENDING') {
      const extId = task.external_id ? Number(task.external_id) : NaN;
      if (!Number.isFinite(extId)) {
        markTaskStatus(db, task.id, 'FAILED', 'missing external_id');
        return { success: false, skipped: true };
      }
      const json = await fetchFullArticleJson(extId);
      if (!json) {
        bumpRetry(db, task.id, 'Dev.to full article fetch failed');
        return { success: false, skipped: true };
      }
      saveRawMaterial(db, task.id, JSON.stringify(json));
      markTaskCrawled(db, task.id);
      fullArticle = json;
    } else {
      const raw = getRawBody(db, task.id);
      if (!raw) {
        bumpRetry(db, task.id, 'raw_materials missing');
        return { success: false, skipped: true };
      }
      fullArticle = JSON.parse(raw) as DevToArticle;
    }

    const { markdown, images: imageUrls } = articleToMarkdown(fullArticle);
    let images = [...imageUrls];

    const advCfg = getCrawlerAdvancedForRun();
    const minMarkdownLen =
      advCfg.minContentChars > 0 ? Math.max(100, advCfg.minContentChars) : 100;
    if (!markdown || markdown.length < minMarkdownLen) {
      insertSyncLog(db, {
        task_id: task.id,
        processed_content: markdown,
        classification_json: null,
        simhash: null,
        sync_status: 'SKIPPED',
        score: null,
        note: `content too short (${markdown?.length ?? 0} < ${minMarkdownLen})`,
      });
      markTaskStatus(db, task.id, 'COMPLETED', null);
      console.log(`⏭️ Skipping: content too short`);
      return { success: false, skipped: true };
    }

    console.log(`📝 Content length: ${markdown.length} chars`);

    console.log(`🧐 AI scoring...`);
    const evaluation = await scoreArticle(fullArticle.title, markdown);
    const scoreVal = typeof evaluation.score === 'number' ? evaluation.score : null;

    if (!scoreVal) {
      insertSyncLog(db, {
        task_id: task.id,
        processed_content: markdown.slice(0, 12000),
        classification_json: JSON.stringify(evaluation),
        simhash: null,
        sync_status: 'SKIPPED',
        score: null,
        note: 'AI scoring failed or empty score',
      });
      markTaskStatus(db, task.id, 'COMPLETED', null);
      return { success: false, skipped: true };
    }

    const eligible = scoreVal >= SCORE_THRESHOLD;

    if (!eligible) {
      insertSyncLog(db, {
        task_id: task.id,
        processed_content: markdown.slice(0, 12000),
        classification_json: JSON.stringify(evaluation),
        simhash: null,
        sync_status: 'SKIPPED',
        score: scoreVal,
        note: `below threshold ${SCORE_THRESHOLD}`,
      });
      markTaskStatus(db, task.id, 'COMPLETED', null);
      console.log(`⏭️ Score ${scoreVal} < ${SCORE_THRESHOLD}, local only`);
      return { success: false, skipped: true };
    }

    runCounters.qualified += 1;

    console.log(`✅ Score: ${scoreVal}/100`);

    const route = await routeArticleSemantic(fullArticle.title, markdown);
    const tv = validateRouteAgainstTaxonomy(route);
    if (!tv.ok) tv.warnings.forEach((w) => console.warn(`[taxonomy] ${w}`));

    console.log(
      `🧭 → ${route.type} | KB: ${route.kb_section_slug ?? '-'} | Blog: ${route.blog_category_slug ?? '-'} | conf: ${route.confidence}`
    );

    const restructured = await restructureArticle(fullArticle.title, markdown, evaluation);

    let contentMd = restructured.content;
    const { markdown: mdAfterR2, urlMap: r2UrlMap } = await rewriteMarkdownImagesToR2(
      contentMd,
      task.id
    );
    contentMd = mdAfterR2;
    images = images.map((u) => r2UrlMap[u] || u);

    const chinesePreview = await translateToChinese(restructured.title, contentMd);
    const simhash = computeSimHash(`${restructured.title}\n${contentMd}`);

    const ingestPayload = {
      title: restructured.title,
      content: contentMd,
      sourceUrl: fullArticle.url,
      score: scoreVal,
      dimensions: evaluation.dimensions,
      difficulty_level: restructured.difficultyLevel,
      is_promotional: evaluation.is_promotional,
      mentor_summary: evaluation.mentor_summary,
      chinese_preview: chinesePreview,
      images,
      tags: restructured.tags,
      reading_time_minutes: restructured.readingTimeMinutes,
      expected_outcome: restructured.expectedOutcome,
      excerpt: restructured.excerpt,
      articleType: route.type,
      kbSectionSlug: route.kb_section_slug ?? undefined,
      blogCategorySlug: route.blog_category_slug ?? undefined,
      routingConfidence: route.confidence,
      routingReasoning: route.reasoning,
      routerKeywords: route.keywords,
      simhash,
      sourceAuthor: fullArticle.user?.name,
    };

    const classificationJson = JSON.stringify({
      route,
      evaluation_summary: { difficulty: evaluation.difficulty_level, promotional: evaluation.is_promotional },
    });

    if (
      CRAWLER_PUSH &&
      process.env.CRAWLER_SKIP_REMOTE_SIMHASH !== 'true' &&
      process.env.INGEST_SECRET &&
      simhash.length >= 16
    ) {
      try {
        const siteUrl = getCrawlerIngestSiteBaseUrl();
        const remoteList = await fetchRemoteSimhashList(siteUrl, process.env.INGEST_SECRET);
        if (remoteSimhashConflict(simhash, remoteList)) {
          insertSyncLog(db, {
            task_id: task.id,
            processed_content: contentMd.slice(0, 12000),
            classification_json: classificationJson,
            simhash,
            sync_status: 'IGNORED',
            score: scoreVal,
            note: 'REMOTE_SIMHASH_PREFLIGHT',
          });
          markTaskStatus(db, task.id, 'IGNORED', 'remote-simhash-preflight');
          console.warn(`⏭️ 云端 SimHash 预检判定近似重复，未发起 ingest`);
          return { success: false, skipped: true };
        }
      } catch (e) {
        console.warn('[simhash-remote] 预检失败，继续推送:', e);
      }
    }

    if (!CRAWLER_PUSH) {
      savePendingPush(fullArticle.url, ingestPayload);
      insertSyncLog(db, {
        task_id: task.id,
        processed_content: contentMd.slice(0, 12000),
        classification_json: classificationJson,
        simhash,
        sync_status: 'NOT_SYNCED',
        score: scoreVal,
        ingest_payload_json: JSON.stringify(ingestPayload),
        note: 'CRAWLER_PUSH off → pending-push file',
      });
      markTaskStatus(db, task.id, 'COMPLETED', null);
      console.log(`📦 已写入 pending-push，未请求线上`);
      return { success: true, skipped: false };
    }

    console.log(`📡 Ingest (${route.type})...`);
    try {
      const resJson = await ingestArticle(ingestPayload);
      const remoteId =
        resJson?.data?.[0]?.id ??
        resJson?.id ??
        resJson?.slug ??
        (typeof resJson === 'object' ? JSON.stringify(resJson).slice(0, 500) : String(resJson));

      insertSyncLog(db, {
        task_id: task.id,
        processed_content: contentMd.slice(0, 12000),
        classification_json: classificationJson,
        simhash,
        sync_status: 'SYNCED',
        remote_id: remoteId != null ? String(remoteId) : null,
        score: scoreVal,
        ingest_payload_json: JSON.stringify(ingestPayload),
      });
      markTaskStatus(db, task.id, 'COMPLETED', null);
      if (route.type === 'KB') runCounters.kbPushed += 1;
      else if (route.type === 'BLOG') runCounters.blogPushed += 1;
      console.log(`✅ 已同步线上`);
      return { success: true, skipped: false };
    } catch (ingestErr: unknown) {
      const msg = ingestErr instanceof Error ? ingestErr.message : String(ingestErr);
      if (msg.includes('409') || msg.includes('SIMHASH_CONFLICT')) {
        insertSyncLog(db, {
          task_id: task.id,
          processed_content: contentMd.slice(0, 12000),
          classification_json: classificationJson,
          simhash,
          sync_status: 'IGNORED',
          score: scoreVal,
          note: 'SIMHASH_CONFLICT',
        });
        markTaskStatus(db, task.id, 'IGNORED', 'near-duplicate');
        console.warn(`⏭️ SimHash duplicate`);
        return { success: false, skipped: true };
      }
      throw ingestErr;
    }
  } catch (e) {
    console.error(`❌ Task error:`, e);
    bumpRetry(db, task.id, e instanceof Error ? e.message : String(e));
    return { success: false, skipped: false };
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  const runCounters: RunCounters = {
    discovered: 0,
    processed: 0,
    qualified: 0,
    kbPushed: 0,
    blogPushed: 0,
  };
  let exitCode: number | null = 0;
  let db: BetterSqlite3.Database | null = null;

  const flushRunHistory = () => {
    const endedAt = new Date().toISOString();
    try {
      appendCrawlerRunHistory({
        startedAt,
        endedAt,
        siteLabel: siteLabelFromConfig(),
        discovered: runCounters.discovered,
        processed: runCounters.processed,
        qualified: runCounters.qualified,
        kbPushed: runCounters.kbPushed,
        blogPushed: runCounters.blogPushed,
        exitCode,
      });
    } catch (e) {
      console.warn('[run-history] 写入失败:', e);
    }
  };

  console.log(
    '🚀 Codcompass Crawler 2.0（文档：本地 Runner + SQLite 三表 + Ingest 单向同步）'
  );
  console.log(`📡 PUSH=${CRAWLER_PUSH} · THRESHOLD=${process.env.CRAWLER_SCORE_THRESHOLD ?? '70'}\n`);

  try {
    await enableHttpProxyFromEnv();

    const sqlite = openCrawlerDb();
    db = sqlite;
    const SCORE_THRESHOLD = Number(process.env.CRAWLER_SCORE_THRESHOLD ?? 70);
    const adv = getCrawlerAdvancedForRun();
    const CONCURRENCY = Math.min(8, Math.max(1, adv.maxConcurrency));

    let discovered = await fetchArticlesFromDevTo();
    discovered = discovered.filter(
      (a) => !titleMatchesKeywordBlacklist(a.title, adv.keywordBlacklist)
    );
    if (adv.maxArticlesPerRun > 0 && discovered.length > adv.maxArticlesPerRun) {
      discovered = discovered.slice(0, adv.maxArticlesPerRun);
    }
    runCounters.discovered = discovered.length;
    console.log(`\n📊 Discovered ${discovered.length} unique Dev.to URLs → 登记 crawl_tasks`);
    for (const a of discovered) {
      upsertPendingTask(sqlite, { url: a.url, source: 'devto', externalId: String(a.id) });
    }

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;
    let processedTotal = 0;

    while (true) {
      const batch = listResolvableTasks(sqlite, CONCURRENCY * 8);
      if (batch.length === 0) break;

      for (let i = 0; i < batch.length; i += CONCURRENCY) {
        const slice = batch.slice(i, i + CONCURRENCY);
        processedTotal += slice.length;
        console.log(`\n📦 Batch ${Math.floor(i / CONCURRENCY) + 1} (${slice.length} tasks)`);

        const results = await Promise.all(
          slice.map((task, j) =>
            processDbTask(sqlite, task, i + j, batch.length, SCORE_THRESHOLD, runCounters)
          )
        );

        results.forEach((r) => {
          if (r.success) successCount++;
          else if (r.skipped) skippedCount++;
          else failCount++;
        });

        if (i + CONCURRENCY < batch.length) {
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Crawler completed!');
    console.log(`✅ Pushed / pending-local OK: ${successCount}`);
    console.log(`⏭️ Skipped (local SQLite): ${skippedCount}`);
    console.log(`❌ Failed / retry: ${failCount}`);
    console.log(`📊 Tasks touched this run: ${processedTotal}`);
  } catch (e) {
    exitCode = 1;
    console.error('❌ Crawler run failed:', e);
    throw e;
  } finally {
    if (db) {
      try {
        db.close();
      } catch {
        /* ignore */
      }
    }
    flushRunHistory();
  }
}

main().catch((error) => {
  console.error('❌ Execution failed:', error);
  process.exit(1);
});
