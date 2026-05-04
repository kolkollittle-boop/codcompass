import { NextRequest, NextResponse } from 'next/server';
import { articleIngestHandler } from '@/lib/article-ingest-handler';
import { normalizeIngestPayload } from '@/lib/ingest-normalize';
import { consumeIngestRateLimit } from '@/lib/ingest-rate-limit';

function authorize(req: NextRequest): boolean {
  const secret = req.headers.get('x-ingest-secret');
  return secret === process.env.INGEST_SECRET && !!secret;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!consumeIngestRateLimit(req.headers.get('x-ingest-secret') || '')) {
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
