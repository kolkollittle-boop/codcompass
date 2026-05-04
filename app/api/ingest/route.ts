/**
 * 方案 4：文档中的 `/api/ingest` 别名，与 `/api/articles/ingest` 行为一致（Header: X-Ingest-Secret）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { articleIngestHandler } from '@/lib/article-ingest-handler';
import { normalizeIngestPayload } from '@/lib/ingest-normalize';
import { consumeIngestRateLimit } from '@/lib/ingest-rate-limit';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!consumeIngestRateLimit(secret)) {
    return NextResponse.json({ error: 'Too Many Requests', code: 'RATE_LIMIT' }, { status: 429 });
  }

  try {
    const raw = (await req.json()) as Record<string, unknown>;
    const body = normalizeIngestPayload(raw);
    return articleIngestHandler(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
