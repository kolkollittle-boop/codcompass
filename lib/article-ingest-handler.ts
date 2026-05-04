import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import { prisma } from '@/lib/db';
import { buildFaqPageGeoJsonLd, buildTechArticleGeoJsonLd } from '@/lib/geo-tech-article';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

marked.setOptions({ gfm: true });

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .trim();
}

function hammingDistanceHex(a: string, b: string): number {
  const ai = BigInt('0x' + a);
  const bi = BigInt('0x' + b);
  let x = ai ^ bi;
  let n = 0;
  const zero = BigInt(0);
  const one = BigInt(1);
  while (x !== zero) {
    n++;
    x &= x - one;
  }
  return n;
}

function extractSimhash(qd: unknown): string | null {
  if (!qd || typeof qd !== 'object') return null;
  const sh = (qd as Record<string, unknown>).simhash;
  return typeof sh === 'string' && sh.length >= 16 ? sh : null;
}

async function findSimhashConflict(incoming: string, excludeArticleId?: string): Promise<boolean> {
  const { data: rows } = await supabase
    .from('Article')
    .select('id, qualityDetails')
    .order('updatedAt', { ascending: false })
    .limit(450);

  if (!rows?.length) return false;

  for (const row of rows) {
    if (excludeArticleId && row.id === excludeArticleId) continue;
    const sh = extractSimhash(row.qualityDetails);
    if (sh && hammingDistanceHex(incoming, sh) < 10) return true;
  }
  return false;
}

/** 方案 0：供本地爬虫推送前拉取 SimHash 列表（Hamming 预检）。 */
export async function listKbArticleSimhashes(limit = 800): Promise<string[]> {
  const { data: rows } = await supabase
    .from('Article')
    .select('qualityDetails')
    .order('updatedAt', { ascending: false })
    .limit(limit);

  const out: string[] = [];
  for (const row of rows || []) {
    const sh = extractSimhash(row.qualityDetails);
    if (sh) out.push(sh);
  }
  return out;
}

function resolveKbStatus(
  aiScore: number | undefined,
  isPromotional: boolean | undefined,
  routingConfidence: number | undefined
): string {
  const minConf = Number(process.env.INGEST_ROUTING_MIN_CONFIDENCE ?? 0.8);
  const conf = routingConfidence ?? 1;

  if (isPromotional) return 'ARCHIVED';
  if (!aiScore || aiScore < 60) return 'ARCHIVED';
  if (aiScore >= 80 && conf >= minConf) return 'PUBLISHED';
  if (aiScore >= 60) return 'REVIEW';
  return 'ARCHIVED';
}

/** 列表/详情用 isPublished；仅 status=PUBLISHED 时对访客可见 */
function kbVisibilityFields(
  status: string,
  existingPublishedAt?: string | null
): { isPublished: boolean; publishedAt: string | null } {
  if (status !== 'PUBLISHED') {
    return { isPublished: false, publishedAt: null };
  }
  const now = new Date().toISOString();
  return {
    isPublished: true,
    publishedAt: existingPublishedAt || now,
  };
}

function blogSlugFromSourceUrl(url: string): string {
  const h = crypto.createHash('sha256').update(url).digest('hex').slice(0, 14);
  return `crawl-${h}`;
}

function resolveBlogPublished(
  aiScore: number | undefined,
  isPromotional: boolean | undefined,
  routingConfidence: number | undefined
): boolean {
  const minConf = Number(process.env.INGEST_ROUTING_MIN_CONFIDENCE ?? 0.8);
  const conf = routingConfidence ?? 1;
  return !!(aiScore && aiScore >= 80 && !isPromotional && conf >= minConf);
}

function parseFaqItems(raw: unknown): Array<{ question: string; answer: string }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ question: string; answer: string }> = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const q = typeof o.question === 'string' ? o.question : typeof o.q === 'string' ? o.q : '';
    const a = typeof o.answer === 'string' ? o.answer : typeof o.a === 'string' ? o.a : '';
    if (q && a) out.push({ question: q, answer: a });
  }
  return out.slice(0, 8);
}

/**
 * 执行单篇入库（已与路由解耦，供 /api/articles/ingest、/api/ingest、batch 共用）。
 * body 须已规范化（flatten）；认证与限速由外层处理。
 */
export async function articleIngestHandler(body: Record<string, unknown>): Promise<NextResponse> {
  try {
    const title = body.title as string;
    const content = body.content as string;
    const sourceUrl = (body.sourceUrl ?? body.source_url) as string | undefined;

    const aiScore = (body.aiScore ?? body.score) as number | undefined;
    const aiFeedback = (body.aiFeedback ?? body.dimensions) as Record<string, unknown> | undefined;
    const mentorSummary = (body.mentorSummary ?? body.mentor_summary) as string | undefined;
    const difficultyLevel = (body.difficultyLevel ?? body.difficulty_level) as string | undefined;
    const isPromotional = body.isPromotional ?? body.is_promotional;
    const chinesePreview = (body.chinesePreview ?? body.chinese_preview) as string | undefined;
    const images = body.images as unknown;

    const tags = (body.tags || []) as unknown[];
    const readingTimeMinutes = (body.readingTimeMinutes ?? body.reading_time_minutes ?? 0) as number;
    const expectedOutcome = (body.expectedOutcome ?? body.expected_outcome ?? '') as string;
    const excerpt = (body.excerpt ?? '') as string;

    const articleType = (body.articleType ?? body.article_type ?? 'KB') as string;
    const kbSectionSlug = (body.kbSectionSlug ?? body.kb_section_slug ?? null) as string | null;
    const blogCategorySlug = (body.blogCategorySlug ?? body.blog_category_slug ?? null) as string | null;
    const routingConfidence =
      typeof body.routingConfidence === 'number'
        ? body.routingConfidence
        : typeof body.routing_confidence === 'number'
          ? body.routing_confidence
          : undefined;
    const routingReasoning = (body.routingReasoning ?? body.routing_reasoning ?? '') as string;
    const routerKeywords = (body.routerKeywords ?? body.router_keywords ?? body.keywords ?? []) as unknown[];

    const simhash =
      typeof body.simhash === 'string'
        ? body.simhash
        : typeof body.simHash === 'string'
          ? body.simHash
          : '';

    const faqItems = parseFaqItems(body.faq);

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    const minConf = Number(process.env.INGEST_ROUTING_MIN_CONFIDENCE ?? 0.8);
    const manualReview =
      routingConfidence !== undefined && routingConfidence !== null && routingConfidence < minConf;

    const isBlog = articleType.toUpperCase() === 'BLOG' || body.destination === 'blog';

    console.log('[Ingest] mode:', isBlog ? 'BLOG' : 'KB', 'aiScore:', aiScore, 'simhash:', simhash || '(none)');

    if (isBlog) {
      if (!sourceUrl) {
        return NextResponse.json({ error: 'Blog ingest requires sourceUrl' }, { status: 400 });
      }
      const catSlug = blogCategorySlug || 'typescript';
      const category = await prisma.blogCategory.findUnique({ where: { slug: catSlug } });
      if (!category) {
        return NextResponse.json({ error: `Unknown blog category slug: ${catSlug}` }, { status: 400 });
      }

      const slug = blogSlugFromSourceUrl(sourceUrl);
      const existed = await prisma.blogPost.findUnique({ where: { slug } });
      const html = await marked.parse(content);
      const published = resolveBlogPublished(
        aiScore,
        Boolean(isPromotional),
        routingConfidence
      );
      const tagList = [...new Set([...tags, ...routerKeywords].map(String))].slice(0, 24);

      const post = await prisma.blogPost.upsert({
        where: { slug },
        create: {
          slug,
          title,
          contentHtml: html,
          excerpt: excerpt || mentorSummary || null,
          author: (body.sourceAuthor ?? body.author) as string | null,
          readingMinutes: Math.max(1, Number(readingTimeMinutes) || 5),
          tags: tagList,
          categoryId: category.id,
          isPublished: published,
          publishedAt: published ? new Date() : null,
          seoTitle: title,
          seoDescription: mentorSummary
            ? `${mentorSummary}\n\nSource: ${sourceUrl}`
            : `Source: ${sourceUrl}`,
        },
        update: {
          title,
          contentHtml: html,
          excerpt: excerpt || mentorSummary || null,
          author: (body.sourceAuthor ?? body.author) as string | null,
          readingMinutes: Math.max(1, Number(readingTimeMinutes) || 5),
          tags: tagList,
          categoryId: category.id,
          isPublished: published,
          publishedAt: published ? new Date() : null,
          seoTitle: title,
          seoDescription: mentorSummary
            ? `${mentorSummary}\n\nSource: ${sourceUrl}`
            : `Source: ${sourceUrl}`,
        },
      });

      const httpStatus = existed ? 200 : 201;
      return NextResponse.json(
        {
          success: true,
          destination: 'blog',
          status: published ? 'PUBLISHED' : 'REVIEW',
          id: post.id,
          slug: post.slug,
        },
        { status: httpStatus }
      );
    }

    if (simhash && simhash.length >= 16) {
      const conflict = await findSimhashConflict(simhash);
      if (conflict) {
        console.log('[Ingest] SimHash near-duplicate, skipping');
        return NextResponse.json(
          { error: 'SIMHASH_CONFLICT', code: 'SIMHASH_CONFLICT', message: 'Near-duplicate content' },
          { status: 409 }
        );
      }
    }

    const status = resolveKbStatus(aiScore, Boolean(isPromotional), routingConfidence);
    console.log('[Ingest] KB status:', status);

    const execSummary =
      (mentorSummary || excerpt || '').replace(/\s+/g, ' ').trim().slice(0, 160) || title.slice(0, 160);

    const geoJsonLd = buildTechArticleGeoJsonLd({
      title,
      description: execSummary,
      proficiencyLevel: difficultyLevel || 'L2',
      isBasedOnUrl: sourceUrl || undefined,
      keywords: Array.isArray(routerKeywords) ? routerKeywords.map(String) : [],
    });

    const faqGeo = buildFaqPageGeoJsonLd(faqItems);

    const qualityDetailsData: Record<string, unknown> = {
      ...(aiFeedback || {}),
      mentor_summary: mentorSummary,
      difficulty_level: difficultyLevel || 'L2',
      chinese_preview: chinesePreview || '',
      images: images || [],
      tags,
      reading_time_minutes: readingTimeMinutes,
      expected_outcome: expectedOutcome,
      excerpt: excerpt,
      articleType: 'KB',
      kbSectionSlug: kbSectionSlug || null,
      routingConfidence: routingConfidence ?? null,
      routingReasoning: routingReasoning || '',
      routerKeywords: Array.isArray(routerKeywords) ? routerKeywords : [],
      simhash: simhash || null,
      manual_review: manualReview,
      geoJsonLd,
      ...(faqGeo ? { faqGeoJsonLd: faqGeo } : {}),
    };

    const descriptionEn = execSummary;

    if (sourceUrl) {
      const { data: existingArticle } = await supabase
        .from('Article')
        .select('id, slug, status, publishedAt')
        .eq('originalUrl', sourceUrl)
        .maybeSingle();

      if (existingArticle) {
        if (existingArticle.status === 'ARCHIVED') {
          console.log('[Ingest] Article already archived, skipping:', sourceUrl);
          return NextResponse.json({
            success: true,
            status: 'SKIPPED_DUPLICATE',
            message: 'Article was previously archived, skipping',
          });
        }
        if (existingArticle.status === 'PUBLISHED') {
          console.log('[Ingest] Article already published, skipping:', sourceUrl);
          return NextResponse.json({
            success: true,
            status: 'SKIPPED_DUPLICATE',
            message: 'Article already exists, skipping',
          });
        }

        if (simhash && simhash.length >= 16) {
          const conflict = await findSimhashConflict(simhash, existingArticle.id);
          if (conflict) {
            return NextResponse.json(
              { error: 'SIMHASH_CONFLICT', code: 'SIMHASH_CONFLICT' },
              { status: 409 }
            );
          }
        }

        console.log('[Ingest] Article exists in REVIEW status, updating:', existingArticle.slug);
        const vis = kbVisibilityFields(
          status,
          'publishedAt' in existingArticle ? (existingArticle as { publishedAt: string | null }).publishedAt : null
        );
        const { data, error } = await supabase
          .from('Article')
          .update({
            titleEn: title,
            contentEn: content,
            descriptionEn,
            qualityScore: aiScore,
            qualityDetails: qualityDetailsData,
            status,
            isPublished: vis.isPublished,
            publishedAt: vis.publishedAt,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', existingArticle.id)
          .select();

        if (error) throw error;

        if (kbSectionSlug && data?.[0]?.id) {
          const { data: cat } = await supabase
            .from('Category')
            .select('id')
            .eq('slug', kbSectionSlug)
            .maybeSingle();
          if (cat?.id) {
            await supabase.from('_ArticleToCategory').delete().eq('A', data[0].id);
            await supabase.from('_ArticleToCategory').insert({ A: data[0].id, B: cat.id });
          }
        }

        return NextResponse.json({ success: true, status: 'UPDATED', destination: 'kb', data }, { status: 200 });
      }
    }

    const uniqueSlug = `${generateSlug(title)}-${Date.now().toString().slice(-6)}`;
    const visNew = kbVisibilityFields(status);

    const { data, error } = await supabase
      .from('Article')
      .insert({
        titleEn: title,
        contentEn: content,
        descriptionEn,
        originalUrl: sourceUrl,
        status: status,
        qualityScore: aiScore,
        qualityDetails: qualityDetailsData,
        slug: uniqueSlug,
        crawledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isPremium: difficultyLevel !== 'L1',
        isPublished: visNew.isPublished,
        publishedAt: visNew.publishedAt,
      })
      .select();

    if (error) throw error;

    const inserted = data?.[0];
    if (inserted?.id && kbSectionSlug) {
      const { data: cat } = await supabase
        .from('Category')
        .select('id')
        .eq('slug', kbSectionSlug)
        .maybeSingle();
      if (cat?.id) {
        await supabase.from('_ArticleToCategory').insert({ A: inserted.id, B: cat.id });
      } else {
        console.warn('[Ingest] Category slug not found:', kbSectionSlug);
      }
    }

    return NextResponse.json({ success: true, status, destination: 'kb', data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Ingest Error]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
