import { readCrawlerRunHistory } from '@/automation/crawler/src/crawler-run-history';
import { assertLocalCrawlerUiEnabled } from '@/lib/local-crawler-ui-guard';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_LIMITS = new Set([5, 10, 20, 30, 50]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    assertLocalCrawlerUiEnabled();
  } catch {
    return jsonError('Not found', 404);
  }

  const raw = req.nextUrl.searchParams.get('limit');
  const n = raw ? parseInt(raw, 10) : 20;
  const limit = ALLOWED_LIMITS.has(n) ? n : 20;
  const rows = readCrawlerRunHistory(limit);
  return NextResponse.json({ ok: true, rows, limit });
}
