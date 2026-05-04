import { NextRequest, NextResponse } from 'next/server';
import { articleIngestHandler } from '@/lib/article-ingest-handler';
import { normalizeIngestPayload } from '@/lib/ingest-normalize';
import { consumeIngestRateLimit } from '@/lib/ingest-rate-limit';

/** 方案 4.2：批量推送（顺序执行，便于观测错误）。 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = (await req.json()) as { articles?: unknown[] };
    const articles = raw.articles;
    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'Expected { articles: [...] }' }, { status: 400 });
    }

    const maxBatch = Number(process.env.INGEST_BATCH_MAX ?? 25);
    if (articles.length > maxBatch) {
      return NextResponse.json(
        { error: `Batch too large (max ${maxBatch})`, code: 'BATCH_LIMIT' },
        { status: 400 }
      );
    }

    if (!consumeIngestRateLimit(secret, articles.length)) {
      return NextResponse.json({ error: 'Too Many Requests', code: 'RATE_LIMIT' }, { status: 429 });
    }

    const results: Array<{ status: number; body: unknown }> = [];

    for (const item of articles) {
      if (!item || typeof item !== 'object') {
        results.push({ status: 400, body: { error: 'Invalid article entry' } });
        continue;
      }
      const body = normalizeIngestPayload(item as Record<string, unknown>);
      const res = await articleIngestHandler(body);
      const payload = await res.json();
      results.push({ status: res.status, body: payload });
    }

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
