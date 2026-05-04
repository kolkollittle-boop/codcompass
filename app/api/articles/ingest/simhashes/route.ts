import { NextRequest, NextResponse } from 'next/server';
import { listKbArticleSimhashes } from '@/lib/article-ingest-handler';

/** 方案 3：供本地爬虫拉取云端 SimHash 采样列表（推送前 Hamming 预检）。 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 800), 1200);

  try {
    const simhashes = await listKbArticleSimhashes(limit);
    return NextResponse.json({ success: true, count: simhashes.length, simhashes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
