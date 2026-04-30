import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 辅助函数：从标题生成 URL 友好的 Slug
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  // 1. 安全校验
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, sourceUrl } = body;
    
    // 兼容两种字段名：camelCase 和 snake_case
    const aiScore = body.aiScore ?? body.score;
    const aiFeedback = body.aiFeedback ?? body.dimensions;
    const mentorSummary = body.mentorSummary ?? body.mentor_summary;
    const difficultyLevel = body.difficultyLevel ?? body.difficulty_level;
    const isPromotional = body.isPromotional ?? body.is_promotional;
    const chinesePreview = body.chinesePreview ?? body.chinese_preview;
    const images = body.images;
    
    // 新增字段：标签、阅读时间、预期收益、摘要
    const tags = body.tags || [];
    const readingTimeMinutes = body.readingTimeMinutes ?? 0;
    const expectedOutcome = body.expectedOutcome ?? '';
    const excerpt = body.excerpt ?? '';

    if (!title || !content) {
        return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    console.log('[Ingest] Received aiScore:', aiScore, 'isPromotional:', isPromotional);
    console.log('[Ingest] Chinese preview length:', chinesePreview?.length || 0);
    console.log('[Ingest] Images count:', images?.length || 0);
    console.log('[Ingest] Content preview (first 100 chars):', content?.substring(0, 100));

    // 2. 自动分流逻辑
    // 使用数据库枚举值：PUBLISHED (已发布), REVIEW (待审核), ARCHIVED (已归档/拒绝)
    let status = 'REVIEW';
    if (isPromotional) {
      status = 'ARCHIVED';
    } else if (aiScore && aiScore >= 75) {
      // 75分以上自动审核通过，直接发布
      status = 'PUBLISHED';
    } else if (!aiScore || aiScore < 60) {
      status = 'ARCHIVED';
    }
    console.log('[Ingest] Setting status:', status);

    // 3. 生成唯一 Slug
    const uniqueSlug = `${generateSlug(title)}-${Date.now().toString().slice(-6)}`;

    // 4. 数据持久化
    // 将所有额外数据合并到 qualityDetails JSON 字段
    const qualityDetailsData = {
      ...(aiFeedback || {}),
      mentor_summary: mentorSummary,
      difficulty_level: difficultyLevel || 'L2',
      chinese_preview: chinesePreview || '',
      images: images || [],
      tags: tags,
      reading_time_minutes: readingTimeMinutes,
      expected_outcome: expectedOutcome,
      excerpt: excerpt,
    };

    const { data, error } = await supabase
      .from('Article')
      .insert({
        titleEn: title,
        contentEn: content,
        originalUrl: sourceUrl,
        status: status,
        qualityScore: aiScore,
        qualityDetails: qualityDetailsData,
        slug: uniqueSlug,
        crawledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isPremium: difficultyLevel !== 'L1',
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, status, data });
  } catch (error: any) {
    console.error('[Ingest Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
