import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { events, timestamp } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events' }, { status: 400 });
    }

    // 这里可以将事件写入数据库或发送到分析服务
    // 例如：Supabase, PostHog, Mixpanel, Google Analytics 等
    for (const event of events) {
      console.log(`[Analytics] ${event.type}`, JSON.stringify(event));
      
      // 示例：写入 Supabase
      // const { error } = await supabaseAdmin
      //   .from('analytics_events')
      //   .insert({
      //     event_type: event.type,
      //     event_data: event,
      //     timestamp: new Date().toISOString(),
      //   });
    }

    return NextResponse.json({ success: true, received: events.length });
  } catch (error) {
    console.error('[Analytics] Error processing events:', error);
    return NextResponse.json({ error: 'Failed to process events' }, { status: 500 });
  }
}
