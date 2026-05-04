import { NextResponse } from 'next/server';
import {
  normalizeAdvanced,
  normalizeSchedule,
  readCrawlerUiConfig,
  writeCrawlerUiConfig,
  type CrawlerExtractTemplate,
  type CrawlerUiConfig,
} from '@/lib/crawler-ui-config';
import {
  assertLocalCrawlerUiEnabled,
  authorizeLocalCrawlerApi,
} from '@/lib/local-crawler-ui-guard';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function parseExtractTemplate(v: unknown): CrawlerExtractTemplate | undefined {
  if (
    v === 'github_trending' ||
    v === 'tech_blog' ||
    v === 'generic_rss' ||
    v === 'roadmap_nodes' ||
    v === 'none'
  ) {
    return v;
  }
  return undefined;
}

export async function GET() {
  try {
    assertLocalCrawlerUiEnabled();
  } catch {
    return jsonError('Not found', 404);
  }
  const config = readCrawlerUiConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(req: Request) {
  try {
    assertLocalCrawlerUiEnabled();
  } catch {
    return jsonError('Not found', 404);
  }
  if (!authorizeLocalCrawlerApi(req)) {
    return jsonError('Unauthorized', 401);
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }
  const incoming = (body as { config?: CrawlerUiConfig })?.config;
  if (!incoming || typeof incoming !== 'object') {
    return jsonError('Missing config', 400);
  }
  const current = readCrawlerUiConfig();

  const schedule = normalizeSchedule({
    ...current.schedule,
    ...(incoming.schedule && typeof incoming.schedule === 'object' ? incoming.schedule : {}),
  } as CrawlerUiConfig['schedule']);

  const advanced = normalizeAdvanced({
    ...current.advanced,
    ...(incoming.advanced && typeof incoming.advanced === 'object' ? incoming.advanced : {}),
  });

  const next: CrawlerUiConfig = {
    version: 1,
    schedule,
    advanced,
    sources: Array.isArray(incoming.sources)
      ? incoming.sources.map((s) => {
          const contentTrack =
            s.contentTrack === 'kb' || s.contentTrack === 'blog' || s.contentTrack === 'ai'
              ? s.contentTrack
              : undefined;
          const priority =
            s.priority === 'P0' || s.priority === 'P1' || s.priority === 'P2'
              ? s.priority
              : undefined;
          const extractTemplate = parseExtractTemplate(s.extractTemplate);
          return {
            id: String(s.id || crypto.randomUUID()).slice(0, 64),
            enabled: Boolean(s.enabled),
            type: s.type === 'rss' || s.type === 'custom' ? s.type : 'devto',
            label: String(s.label || '未命名').slice(0, 120),
            tags: Array.isArray(s.tags)
              ? s.tags.map((t) => String(t).trim().slice(0, 80)).filter(Boolean)
              : [],
            feedUrl: s.feedUrl ? String(s.feedUrl).slice(0, 2048) : undefined,
            siteUrl: s.siteUrl ? String(s.siteUrl).slice(0, 2048) : undefined,
            articlesPerTag:
              typeof s.articlesPerTag === 'number'
                ? Math.min(30, Math.max(1, Math.floor(s.articlesPerTag)))
                : 5,
            contentTrack,
            priority,
            expectedCategory: s.expectedCategory
              ? String(s.expectedCategory).slice(0, 160)
              : undefined,
            crawlStrategy: s.crawlStrategy
              ? String(s.crawlStrategy).slice(0, 500)
              : undefined,
            extractTemplate,
          };
        })
      : current.sources,
    lastRun: current.lastRun,
  };
  if (next.sources.length === 0) {
    return jsonError('至少保留一个数据源', 400);
  }
  writeCrawlerUiConfig(next);
  return NextResponse.json({ ok: true, config: next });
}
