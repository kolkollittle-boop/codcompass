import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // 检查是否已订阅
    const { data: existing } = await supabase
      .from('NewsletterSubscriber')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    // 插入新订阅者
    const { data, error } = await supabase
      .from('NewsletterSubscriber')
      .insert({
        email,
        status: 'active',
        subscribedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Newsletter Subscribe Error]', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Subscribed successfully', data });
  } catch (error: any) {
    console.error('[Newsletter Subscribe Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 获取订阅统计
    if (action === 'stats') {
      const { count: totalCount } = await supabase
        .from('NewsletterSubscriber')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('NewsletterSubscriber')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return NextResponse.json({
        total: totalCount ?? 0,
        active: activeCount ?? 0,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Newsletter Stats Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
