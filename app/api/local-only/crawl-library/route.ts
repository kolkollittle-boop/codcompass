import { listCrawlLocalLibrary } from '@/lib/crawl-local-library';
import { crawlerSqliteExists } from '@/lib/crawler-sqlite-path';
import { assertLocalCrawlerUiEnabled } from '@/lib/local-crawler-ui-guard';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    assertLocalCrawlerUiEnabled();
  } catch {
    return jsonError('Not found', 404);
  }

  if (!crawlerSqliteExists()) {
    return NextResponse.json({
      ok: true,
      rows: [],
      total: 0,
      message: '本地 SQLite 尚未创建，请先运行至少一次爬虫。',
    });
  }

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '40', 10) || 40));
  const offset = Math.max(0, parseInt(sp.get('offset') || '0', 10) || 0);
  const q = sp.get('q') || undefined;
  const status = sp.get('status') || undefined;

  const { rows, total } = listCrawlLocalLibrary({ limit, offset, q, status });
  return NextResponse.json({ ok: true, rows, total, limit, offset });
}
