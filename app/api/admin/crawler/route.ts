import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enqueueAndDispatchCrawler } from '@/lib/crawler-dispatch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST：快速入队 + 触发 GitHub Actions（仅等待 GitHub HTTP，默认 ≤12s），不执行爬虫进程。
 * GET ?jobId=：查询单条 CrawlerJob。
 */
export async function POST() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase is not configured for admin crawler API.' },
        { status: 500 }
      );
    }

    const result = await enqueueAndDispatchCrawler(supabase, {
      triggerSource: 'admin',
    });

    const success = result.status !== 'dispatch_failed';

    return NextResponse.json(
      {
        success,
        jobId: result.jobId,
        status: result.status,
        dispatchTarget: result.dispatchTarget,
        githubAccepted: result.githubAccepted,
        actionsUrl: result.actionsUrl,
        errorMessage: result.errorMessage,
        message: result.message,
      },
      { status: success ? 200 : 502 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const { data, error } = await supabase.from('CrawlerJob').select('*').eq('id', jobId).maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: data });
  }

  return NextResponse.json({
    message:
      'Use POST to enqueue a crawler run (GitHub Actions / queue). Use GET ?jobId=<uuid> to fetch job status.',
  });
}
