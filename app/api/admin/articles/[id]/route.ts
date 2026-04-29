import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, difficultyLevel, monetization, contentEn, titleEn } = body;
    const articleId = params.id;

    // 先获取现有的 qualityDetails
    const { data: existingArticle } = await supabase
      .from('Article')
      .select('qualityDetails')
      .eq('id', articleId)
      .single();

    const existingQD = existingArticle?.qualityDetails || {};
    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          status: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date().toISOString(),
        };
        if (contentEn) {
          updateData.contentEn = contentEn;
        }
        if (titleEn) {
          updateData.titleEn = titleEn;
        }
        if (monetization) {
          updateData.isPremium = monetization === 'premium';
        }
        // 更新 qualityDetails 中的 difficulty_level
        if (difficultyLevel || monetization) {
          updateData.qualityDetails = {
            ...existingQD,
            ...(difficultyLevel ? { difficulty_level: difficultyLevel } : {}),
          };
        }
        break;

      case 'reject':
        updateData = {
          status: 'ARCHIVED',
          isPublished: false,
        };
        break;

      case 'save':
        if (contentEn) {
          updateData.contentEn = contentEn;
        }
        if (titleEn) {
          updateData.titleEn = titleEn;
        }
        if (monetization) {
          updateData.isPremium = monetization === 'premium';
        }
        // 更新 qualityDetails
        updateData.qualityDetails = {
          ...existingQD,
          ...(difficultyLevel ? { difficulty_level: difficultyLevel } : {}),
        };
        updateData.status = 'REVIEW';
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from('Article')
      .update(updateData)
      .eq('id', articleId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Article ${action}d successfully`,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
