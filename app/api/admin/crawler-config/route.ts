import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('CrawlerConfig')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || {
        schedule: '0 * * * *',
        enabled: true,
        sources: [],
        translateContent: true,
        translateTargetLanguages: ['zh'],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 先检查是否已有配置
    const { data: existing } = await supabase
      .from('CrawlerConfig')
      .select('id')
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('CrawlerConfig')
        .update({
          schedule: body.schedule,
          enabled: body.enabled,
          sources: body.sources,
          translateContent: body.translateContent,
          translateTargetLanguages: body.translateTargetLanguages,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('CrawlerConfig')
        .insert({
          schedule: body.schedule,
          enabled: body.enabled,
          sources: body.sources,
          translateContent: body.translateContent,
          translateTargetLanguages: body.translateTargetLanguages,
        })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
