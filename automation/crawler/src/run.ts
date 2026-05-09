import { CrawlerUiConfig } from './crawler-ui-config.js';

/**
 * Codcompass 爬虫 2.0 — 对齐 docs「架构重组：本地-云端双轨制」「断点续爬」：
 * - 本地 SQLite：CrawlTasks / RawMaterials / SyncLogs
 * - 代理池轮换（PROXY_POOL_URLS）：请求失败时自动切换代理出口
 * - 仅通过 Ingest API 推送；AI ≥80 且未关闭 CRAWLER_PUSH 时才请求线上
 */
import { scoreArticle } from './ai-scorer';
import { ingestArticle } from './ingest';
import { getCrawlerIngestSiteBaseUrl } from './ingest-site-url.js';
import { restructureArticle, generateExcerpt, extractTags } from './article-restructurer';
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
  taskIdFromUrl,
} from './local-sqlite';
import { enableHttpProxyFromEnv, initProxyPoolOnce, getProxyPoolStatus } from './proxy-env';
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
import {
  fetchCategoryStats,
  calculateCategoryGaps,
  allCategoriesFilled,
  getMostNeededCategory,
  getCategoryCrawlerSummary,
  printCategoryGaps,
} from './category-crawler.js';
import {
  fetchRoadmapSh,
  fetchRefactoringGuru,
  fetchVercelBlog,
  fetchCloudflareBlog,
  fetchInfoQ,
  fetchAnthropicCookbook,
  webArticleToDevToFormat,
} from './web-crawler.js';
import {
  fetchMultipleRssSources,
  PREMIUM_RSS_SOURCES,
  type RssSourceConfig,
} from './rss-crawler.js';

const CRAWLER_PUSH = !['false', '0', 'no'].includes(String(process.env.CRAWLER_PUSH ?? 'true').toLowerCase());

type RunCounters = {
  discovered: number;
  processed: number;
  qualified: number;
  kbPushed: number;
  blogPushed: number;
  categoryMode: boolean;
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
  const adv = getCrawlerAdvancedForRun();
  const maxArticlesPerRun = adv.maxArticlesPerRun > 0 ? adv.maxArticlesPerRun : 2000;
  const perPage = Math.min(30, Math.max(5, articlesPerTag));
  const delayBetweenPages = 1000;

  for (const tag of tags) {
    if (allArticles.length >= maxArticlesPerRun) {
      console.log(`📊 Reached maxArticlesPerRun (${maxArticlesPerRun}), stopping fetch`);
      break;
    }

    let page = 1;
    let fetchedForTag = 0;
    const remainingSlots = maxArticlesPerRun - allArticles.length;
    const maxPagesForTag = Math.min(20, Math.ceil(remainingSlots / perPage));

    console.log(`📚 Fetching articles from Dev.to with tag: ${tag} (max ${maxPagesForTag} pages)`);

    while (page <= maxPagesForTag) {
      const url = `${DEVTO_API_URL}?tag=${encodeURIComponent(tag)}&per_page=${perPage}&sort_by=public_reactions_count&page=${page}`;
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'CodcompassKB/1.0 (educational crawler)',
          },
        });
        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch ${tag} page ${page}: ${response.status}`);
          if (response.status === 429) {
            console.log(`⏳ Rate limited, waiting 5s...`);
            await new Promise((r) => setTimeout(r, 5000));
            continue;
          }
          break;
        }
        const articles: DevToArticle[] = await response.json();
        if (articles.length === 0) {
          console.log(`✅ No more articles for tag: ${tag}`);
          break;
        }
        console.log(`✅ Got ${articles.length} articles for tag: ${tag} (page ${page})`);
        allArticles.push(...articles);
        fetchedForTag += articles.length;
        page++;

        if (allArticles.length >= maxArticlesPerRun) {
          console.log(`📊 Reached maxArticlesPerRun (${maxArticlesPerRun})`);
          break;
        }

        await new Promise((r) => setTimeout(r, delayBetweenPages));
      } catch (error) {
        console.error(`❌ Error fetching ${tag} page ${page}:`, error);
        break;
      }
    }

    console.log(`📊 Tag ${tag}: fetched ${fetchedForTag} articles total`);
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

async function processDbTask(
  db: BetterSqlite3.Database,
  task: CrawlTaskRow,
  idx: number,
  total: number,
  SCORE_THRESHOLD: number,
  runCounters: RunCounters,
  categoryGaps: import('./category-crawler').CategoryGapInfo[] = [],
  mostNeededCategory: string | null = null
): Promise<{ success: boolean; skipped: boolean }> {
  console.log(`\n[${idx + 1}/${total}] task=${task.status} ${task.url}`);

  let fullArticle: DevToArticle;

  try {
    runCounters.processed += 1;

    if (task.status === 'PENDING') {
      // 检查是否是非 Dev.to 文章（web-crawler 已经抓取了完整内容）
      const isWebArticle = task.external_id && !/^\d+$/.test(task.external_id);
      
      if (isWebArticle) {
        // 非 Dev.to 文章：内容已经在登记时保存到 raw_materials，直接标记为 CRAWLED
        markTaskCrawled(db, task.id);
        // 从 raw_materials 读取内容
        const raw = getRawBody(db, task.id);
        if (!raw) {
          bumpRetry(db, task.id, 'raw_materials missing for web article');
          return { success: false, skipped: true };
        }
        fullArticle = JSON.parse(raw) as DevToArticle;
      } else {
        // Dev.to 文章：需要调用 API 获取完整内容
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
      }
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
    const isFeatured = scoreVal >= 80; // 80+ is featured, 60-79 is indexed

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

    // ─── 分类爬虫模式：优先路由到最需要的分类 ──────────────────────────────
    let finalKbSectionSlug = route.kb_section_slug;
    if (runCounters.categoryMode && mostNeededCategory && route.type === 'KB') {
      // 如果 AI 路由的结果是 KB 类型，且有分类目标，优先使用最需要的分类
      // 但前提是 AI 路由的分类与最需要的分类在同一个大类下，或者 AI 路由的置信度较低
      const neededGap = categoryGaps.find(g => g.slug === mostNeededCategory);
      if (neededGap && neededGap.gap > 0) {
        // 检查 AI 路由的分类是否与最需要的分类相关
        // 简单策略：如果 AI 路由的分类没有达到目标，就使用 AI 的分类
        // 否则，尝试将文章路由到最需要的分类
        const aiCategoryGap = categoryGaps.find(g => g.slug === route.kb_section_slug);
        if (aiCategoryGap && aiCategoryGap.gap <= 0 && route.confidence < 0.9) {
          // AI 路由的分类已达标，且置信度不高，尝试使用最需要的分类
          console.log(`🎯 分类爬虫：AI 路由 ${route.kb_section_slug} 已达标，尝试切换到 ${mostNeededCategory}`);
          finalKbSectionSlug = mostNeededCategory;
        } else if (!aiCategoryGap || aiCategoryGap.gap > 0) {
          // AI 路由的分类还有缺口，保持 AI 的分类
          console.log(`🎯 分类爬虫：保持 AI 路由 ${route.kb_section_slug}（缺口 ${aiCategoryGap?.gap ?? 'N/A'}）`);
        }
      }
    }

    console.log(
      `🧭 → ${route.type} | KB: ${finalKbSectionSlug ?? '-'} | Blog: ${route.blog_category_slug ?? '-'} | conf: ${route.confidence}`
    );

    let contentSourceMd: string;
    let diffLevel: string;
    let excerptStr: string;
    let tagsForPost: string[];
    let readingMinutesVal: number;
    let expectedOutcomeStr: string;

    if (route.type === 'BLOG') {
      // 博客保持原文（英文源站），不走重构模型，避免正文/摘要被译成中文
      contentSourceMd = markdown;
      excerptStr = generateExcerpt(markdown);
      tagsForPost = extractTags(markdown, fullArticle.title);
      readingMinutesVal = Math.max(1, Math.ceil((markdown.length / 1000) * 5));
      expectedOutcomeStr = '';
      diffLevel = evaluation.difficulty_level || 'L2';
    } else {
      const restructured = await restructureArticle(fullArticle.title, markdown, evaluation);
      contentSourceMd = restructured.content;
      excerptStr = restructured.excerpt;
      tagsForPost = restructured.tags;
      readingMinutesVal = restructured.readingTimeMinutes;
      expectedOutcomeStr = restructured.expectedOutcome;
      diffLevel = restructured.difficultyLevel;
    }

    let contentMd = contentSourceMd;
    const { markdown: mdAfterR2, urlMap: r2UrlMap } = await rewriteMarkdownImagesToR2(
      contentMd,
      task.id
    );
    contentMd = mdAfterR2;
    images = images.map((u) => r2UrlMap[u] || u);

    const chinesePreview = '';
    const simhash = computeSimHash(`${fullArticle.title}\n${contentMd}`);

    const ingestPayload = {
      title: fullArticle.title,
      content: contentMd,
      sourceUrl: fullArticle.url,
      score: scoreVal,
      dimensions: evaluation.dimensions,
      difficulty_level: diffLevel,
      is_promotional: evaluation.is_promotional,
      mentor_summary: route.type === 'BLOG' ? '' : evaluation.mentor_summary,
      chinese_preview: chinesePreview,
      images,
      tags: tagsForPost,
      reading_time_minutes: readingMinutesVal,
      expected_outcome: expectedOutcomeStr,
      excerpt: excerptStr,
      articleType: route.type,
      kbSectionSlug: finalKbSectionSlug ?? undefined,
      blogCategorySlug: route.blog_category_slug ?? undefined,
      routingConfidence: route.confidence,
      routingReasoning: route.reasoning,
      routerKeywords: route.keywords,
      simhash,
      sourceAuthor: fullArticle.user?.name,
      is_featured: isFeatured, // Add is_featured field based on score
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
      if (route.type === 'KB') {
        runCounters.kbPushed += 1;
        // 更新分类缺口
        if (runCounters.categoryMode && finalKbSectionSlug) {
          const gap = categoryGaps.find(g => g.slug === finalKbSectionSlug);
          if (gap) {
            gap.currentCount += 1;
            gap.gap = Math.max(0, gap.targetCount - gap.currentCount);
          }
          // 重新排序缺口
          categoryGaps.sort((a, b) => b.gap - a.gap);
          mostNeededCategory = getMostNeededCategory(categoryGaps);
        }
      }
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

/**
 * 从所有数据源抓取文章，登记到 SQLite
 */
async function discoverArticlesFromAllSources(
  sqlite: BetterSqlite3.Database,
  config: CrawlerUiConfig,
  runCounters: RunCounters
): Promise<number> {
  const enabledSources = config.sources.filter((s: { enabled: boolean }) => s.enabled);
  console.log(`📡 启用的数据源: ${enabledSources.map((s: { label: string }) => s.label).join(', ')}`);

  const adv = getCrawlerAdvancedForRun();
  let discovered: DevToArticle[] = [];

  // 先抓取其他数据源，最后处理 Dev.to（避免 Dev.to 大量文章占用过多 API 配额）
  const otherSources = [
    { key: 'Roadmap', fn: fetchRoadmapSh },
    { key: 'Refactoring', fn: fetchRefactoringGuru },
    { key: 'Vercel', fn: fetchVercelBlog },
    { key: 'Cloudflare', fn: fetchCloudflareBlog },
    { key: 'InfoQ', fn: fetchInfoQ },
    { key: 'Anthropic', fn: fetchAnthropicCookbook },
    { key: 'RSS', fn: () => fetchMultipleRssSources(PREMIUM_RSS_SOURCES) },
  ];

  // 处理常规数据源
  for (const src of otherSources) {
    if (enabledSources.some((s: { label: string }) => s.label.includes(src.key))) {
      console.log(`\n🔍 开始抓取 ${src.key}...`);
      try {
        const articles = await src.fn();
        discovered.push(...articles.map(a => webArticleToDevToFormat(a)));
        console.log(`✅ ${src.key} 完成: ${articles.length} 篇`);
      } catch (e: any) {
        console.warn(`⚠️ ${src.key} 抓取失败: ${e.message}`);
      }
    }
  }

  // 处理 RSS 数据源（根据配置中的 siteUrl 匹配）
  const rssSources = enabledSources.filter((s: import('./crawler-ui-config.js').CrawlerSourceRow) => s.type === 'rss');
  if (rssSources.length > 0) {
    console.log(`\n📡 开始抓取 RSS 数据源 (${rssSources.length} 个)...`);
    const rssConfigs: import('./rss-crawler.js').RssSourceConfig[] = rssSources.map((s: import('./crawler-ui-config.js').CrawlerSourceRow) => ({
      label: s.label,
      feedUrl: s.siteUrl || '',
      maxArticles: s.articlesPerTag || 20,
    }));
    try {
      const rssArticles = await fetchMultipleRssSources(rssConfigs);
      discovered.push(...rssArticles.map(a => webArticleToDevToFormat(a)));
      console.log(`✅ RSS 完成: ${rssArticles.length} 篇`);
    } catch (e: any) {
      console.warn(`⚠️ RSS 抓取失败: ${e.message}`);
    }
  }

  // 最后处理 Dev.to（限制数量，避免占用过多 API 配额）
  const devtoSource = enabledSources.find((s: { type: string }) => s.type === 'devto');
  if (devtoSource) {
    console.log('\n🔍 开始抓取 Dev.to...');
    const devtoArticles = await fetchArticlesFromDevTo();
    // 限制 Dev.to 文章数量，为其他数据源留出配额
    const maxDevtoArticles = Math.floor(adv.maxArticlesPerRun * 0.5) || 100;
    const limitedDevtoArticles = devtoArticles.slice(0, maxDevtoArticles);
    discovered.push(...limitedDevtoArticles);
    console.log(`✅ Dev.to 完成: ${limitedDevtoArticles.length} 篇（原始 ${devtoArticles.length} 篇）`);
  }

  // 过滤黑名单和限制数量
  discovered = discovered.filter(
    (a) => !titleMatchesKeywordBlacklist(a.title, adv.keywordBlacklist)
  );
  if (adv.maxArticlesPerRun > 0 && discovered.length > adv.maxArticlesPerRun) {
    discovered = discovered.slice(0, adv.maxArticlesPerRun);
  }

  console.log(`\n📊 本轮发现 ${discovered.length} 篇文章（所有数据源）→ 登记 crawl_tasks`);
  
  // 登记到 SQLite（upsert 会自动跳过已存在的 URL）
  for (const a of discovered) {
    // 更精确地匹配数据源标签
    let sourceLabel = 'unknown';
    const urlLower = a.url.toLowerCase();
    
    for (const s of enabledSources) {
      const labelLower = (s.label || '').toLowerCase();
      
      // Dev.to 直接匹配域名
      if (s.type === 'devto' && urlLower.includes('dev.to')) {
        sourceLabel = s.label;
        break;
      }
      
      // RSS 类型：直接匹配 siteUrl（feedUrl）
      if (s.type === 'rss' && s.siteUrl) {
        const siteUrlLower = (s.siteUrl || '').toLowerCase();
        // 匹配 feed URL 或域名
        if (urlLower.includes(siteUrlLower.replace('https://', '').split('/')[0])) {
          sourceLabel = s.label;
          break;
        }
      }
      
      // 提取 label 的多个关键词进行匹配（去掉括号和中文描述）
      // 如 "Vercel Blog" → ["vercel", "blog"]
      // "Anthropic Cookbook" → ["anthropic", "cookbook"]
      const coreLabel = labelLower.split(/[（(]/)[0].trim();
      const keywords = coreLabel.split(/\s+/).filter((k: string) => k.length > 2);
      
      // 检查 URL 是否包含任意一个关键词
      for (const keyword of keywords) {
        if (urlLower.includes(keyword)) {
          sourceLabel = s.label;
          break;
        }
      }
      if (sourceLabel !== 'unknown') break;
      
      // 额外检查：对于 GitHub 仓库，匹配 github.com/用户名/仓库名
      if (s.extractTemplate === 'github_trending' && urlLower.includes('github.com')) {
        // 从 siteUrl 提取仓库名
        const siteUrlLower = (s.siteUrl || '').toLowerCase();
        if (siteUrlLower && urlLower.includes(siteUrlLower.replace('https://', ''))) {
          sourceLabel = s.label;
          break;
        }
      }
    }
    upsertPendingTask(sqlite, { url: a.url, source: sourceLabel, externalId: String(a.id) });
    
    // 对于非 Dev.to 文章（web-crawler 已经抓取了完整内容），立即保存原始内容到 raw_materials
    if ((a as any)._isWebArticle) {
      const taskId = taskIdFromUrl(a.url);
      const rawContent = JSON.stringify({
        id: a.id,
        title: a.title,
        description: a.description,
        url: a.url,
        user: a.user,
        published_at: a.published_at,
        positive_reactions_count: a.positive_reactions_count,
        reading_time_minutes: a.reading_time_minutes,
        body_html: a.body_html,
        body_markdown: a.body_markdown,
        cover_image: a.cover_image,
        _isWebArticle: true,
      });
      saveRawMaterial(sqlite, taskId, rawContent);
    }
  }

  runCounters.discovered += discovered.length;
  return discovered.length;
}

async function main() {
  const startedAt = new Date().toISOString();
  const runCounters: RunCounters = {
    discovered: 0,
    processed: 0,
    qualified: 0,
    kbPushed: 0,
    blogPushed: 0,
    categoryMode: false,
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

  // ─── 分类爬虫模式 ──────────────────────────────────────────────────────
  const config = readCrawlerUiConfig();
  const categoryTargets = config.categoryTargets || {};
  const hasCategoryTargets = Object.keys(categoryTargets).length > 0;
  
  let categoryGaps: import('./category-crawler').CategoryGapInfo[] = [];
  let mostNeededCategory: string | null = null;

  if (hasCategoryTargets && CRAWLER_PUSH) {
    console.log('📋 检测到分类目标配置，启动分类爬虫模式...');
    runCounters.categoryMode = true;

    // 获取线上分类统计
    const stats = await fetchCategoryStats(
      config.advanced.ingestBaseUrlHint || '',
      process.env.INGEST_SECRET || ''
    );

    // 计算缺口
    categoryGaps = calculateCategoryGaps(stats, categoryTargets);
    printCategoryGaps(categoryGaps);
    console.log(getCategoryCrawlerSummary(categoryGaps));

    // 注意：不再因为"达标"而停止运行
    // 用户要求持续运行，直到推送到正式环境 KB 和 Blog 的数量达标
    if (allCategoriesFilled(categoryGaps)) {
      console.log('⚠️ 所有分类都已达到目标数量，但继续运行以推送更多文章');
    }

    mostNeededCategory = getMostNeededCategory(categoryGaps);
    console.log(`🎯 当前最需要填充的分类: ${mostNeededCategory}`);
    console.log('');
  }

  try {
    // 初始化代理池（支持多代理轮换）
    initProxyPoolOnce();
    await enableHttpProxyFromEnv();
    
    // 打印代理池状态
    const proxyStatus = getProxyPoolStatus();
    if (proxyStatus.total > 0) {
      console.log(`[代理池] 状态: ${proxyStatus.healthy}/${proxyStatus.total} 可用`);
    }

    const sqlite = openCrawlerDb();
    db = sqlite;
    const SCORE_THRESHOLD = Number(process.env.CRAWLER_SCORE_THRESHOLD ?? 60); // Changed from 70 to 60
    const adv = getCrawlerAdvancedForRun();
    const CONCURRENCY = Math.min(8, Math.max(1, adv.maxConcurrency));

    // 持续运行直到达到推送目标（KB 和 Blog 数量）
    const targetKbPushed = Number(process.env.TARGET_KB_PUSHED || 0);
    const targetBlogPushed = Number(process.env.TARGET_BLOG_PUSHED || 0);
    const maxRounds = Number(process.env.MAX_CRAWL_ROUNDS || 5);
    let round = 0;

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;
    let processedTotal = 0;

    while (round < maxRounds) {
      round++;
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔄 第 ${round} 轮抓取...`);
      console.log(`${'='.repeat(50)}`);

      // 每轮都重新抓取所有数据源的新文章
      const discoveredCount = await discoverArticlesFromAllSources(sqlite, config, runCounters);
      if (discoveredCount === 0) {
        console.log('⚠️ 本轮没有发现新文章，等待下一轮...');
        await new Promise((r) => setTimeout(r, 10000));
        continue;
      }

      // 处理可解决的任务
      const batch = listResolvableTasks(sqlite, CONCURRENCY * 8);
      if (batch.length === 0) {
        console.log('⚠️ 没有可处理的任务，等待下一轮...');
        await new Promise((r) => setTimeout(r, 10000));
        continue;
      }

      for (let i = 0; i < batch.length; i += CONCURRENCY) {
        const slice = batch.slice(i, i + CONCURRENCY);
        processedTotal += slice.length;
        console.log(`\n📦 Batch ${Math.floor(i / CONCURRENCY) + 1} (${slice.length} tasks)`);

        const results = await Promise.all(
          slice.map((task, j) =>
            processDbTask(sqlite, task, i + j, batch.length, SCORE_THRESHOLD, runCounters, categoryGaps, mostNeededCategory)
          )
        );

        results.forEach((r) => {
          if (r.success) successCount++;
          else if (r.skipped) skippedCount++;
          else failCount++;
        });

        if (i + CONCURRENCY < batch.length) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      // 检查是否达到推送目标
      if (targetKbPushed > 0 && runCounters.kbPushed >= targetKbPushed) {
        console.log(`✅ KB 推送目标已达成 (${runCounters.kbPushed}/${targetKbPushed})`);
      }
      if (targetBlogPushed > 0 && runCounters.blogPushed >= targetBlogPushed) {
        console.log(`✅ Blog 推送目标已达成 (${runCounters.blogPushed}/${targetBlogPushed})`);
      }

      // 如果两个目标都达成，停止运行
      if ((targetKbPushed === 0 || runCounters.kbPushed >= targetKbPushed) &&
          (targetBlogPushed === 0 || runCounters.blogPushed >= targetBlogPushed)) {
        console.log('🎯 所有推送目标已达成，停止运行');
        break;
      }

      console.log(`📊 当前进度: KB=${runCounters.kbPushed}/${targetKbPushed || '∞'}, Blog=${runCounters.blogPushed}/${targetBlogPushed || '∞'}`);
    }

    if (round >= maxRounds) {
      console.log(`⚠️ 已达到最大轮次限制 (${maxRounds})`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Crawler completed!');
    console.log(`✅ Pushed / pending-local OK: ${successCount}`);
    console.log(`⏭️ Skipped (local SQLite): ${skippedCount}`);
    console.log(`❌ Failed / retry: ${failCount}`);
    console.log(`📊 Tasks touched this run: ${processedTotal}`);
    console.log(`📊 Total discovered: ${runCounters.discovered}`);
    console.log(`📊 Total qualified: ${runCounters.qualified}`);
    console.log(`📊 KB pushed: ${runCounters.kbPushed}`);
    console.log(`📊 Blog pushed: ${runCounters.blogPushed}`);
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
