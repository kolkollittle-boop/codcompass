import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticateRequest, checkRateLimit } from '@/lib/auth-middleware';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekunyyscyqhasolbbohw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

/**
 * POST /api/articles
 * Create or update articles
 * 
 * Authentication: Required (API Key or User Session)
 * Rate Limit: 100 requests per minute
 * 
 * Body:
 * {
 *   articles: Array<{
 *     slug: string,
 *     titleEn: string,
 *     contentEn: string,
 *     excerptEn?: string,
 *     descriptionEn?: string,
 *     isPremium?: boolean,
 *     isPublished?: boolean,
 *     categorySlug?: string
 *   }>
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIp, 100, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { articles } = body;

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'articles array is required' },
        { status: 400 }
      );
    }

    // Get categories
    const { data: categories } = await supabase
      .from('Category')
      .select('slug, id');

    const categoryMap: Record<string, string> = {};
    categories?.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    const results = [];

    for (const article of articles) {
      // Check if article exists
      const { data: existing } = await supabase
        .from('Article')
        .select('id')
        .eq('slug', article.slug)
        .single();

      const now = new Date().toISOString();
      const insertData: any = {
        id: crypto.randomUUID(),
        slug: article.slug,
        titleEn: article.titleEn,
        contentEn: article.contentEn,
        excerptEn: article.excerptEn || null,
        descriptionEn: article.descriptionEn || null,
        isPremium: article.isPremium ?? true,
        isPublished: article.isPublished ?? true,
        publishedAt: article.publishedAt || now,
        createdAt: now,
        updatedAt: now,
      };

      const updateData: any = {
        slug: article.slug,
        titleEn: article.titleEn,
        contentEn: article.contentEn,
        excerptEn: article.excerptEn || null,
        descriptionEn: article.descriptionEn || null,
        isPremium: article.isPremium ?? true,
        isPublished: article.isPublished ?? true,
        publishedAt: article.publishedAt || now,
        updatedAt: now,
      };

      let result;

      if (existing) {
        // Update existing article
        const { data, error } = await supabase
          .from('Article')
          .update(updateData)
          .eq('slug', article.slug)
          .select()
          .single();

        if (error) {
          results.push({ slug: article.slug, status: 'error', error: error.message });
          continue;
        }

        result = { slug: article.slug, status: 'updated', id: data.id };
      } else {
        // Create new article
        const { data, error } = await supabase
          .from('Article')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          results.push({ slug: article.slug, status: 'error', error: error.message });
          continue;
        }

        result = { slug: article.slug, status: 'created', id: data.id } as any;

        // Link to category if provided
        if (article.categorySlug && categoryMap[article.categorySlug]) {
          await supabase
            .from('_ArticleToCategory')
            .insert({
              A: data.id,
              B: categoryMap[article.categorySlug],
            });
          (result as any).categoryLinked = article.categorySlug;
        }
      }

      results.push(result);
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    });
  } catch (error: any) {
    console.error('[Articles API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/articles
 * List all articles
 * 
 * Authentication: Optional (API Key or User Session for full access)
 * Rate Limit: 200 requests per minute
 */
export async function GET(req: NextRequest) {
  try {
    // Optional authentication - public can access published articles only
    const auth = await authenticateRequest(req);
    
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIp, 200, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const published = searchParams.get('published');

    let query = supabase
      .from('Article')
      .select(`
        id,
        slug,
        titleEn,
        excerptEn,
        descriptionEn,
        isPremium,
        isPublished,
        publishedAt,
        viewCount
      `)
      .limit(limit)
      .range(offset, offset + limit - 1)
      .order('publishedAt', { ascending: false });

    // Public users can only see published articles
    if (!auth.authenticated || published === 'true') {
      query = query.eq('isPublished', true);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Fetch categories for each article via the join table
    const articles = (data || []).map((article: any) => ({
      id: article.id,
      slug: article.slug,
      titleEn: article.titleEn,
      excerptEn: article.excerptEn,
      descriptionEn: article.descriptionEn,
      isPremium: article.isPremium,
      isPublished: article.isPublished,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount,
      categories: [],
    }));

    if (articles.length > 0) {
      const articleIds = articles.map((a: any) => a.id);
      const { data: joinData } = await supabase
        .from('_ArticleToCategory')
        .select('A, B, Category(slug, name)')
        .in('A', articleIds);

      const categoryMap: Record<string, any[]> = {};
      joinData?.forEach((row: any) => {
        if (!categoryMap[row.A]) categoryMap[row.A] = [];
        categoryMap[row.A].push(row.Category);
      });

      articles.forEach((article: any) => {
        article.categories = categoryMap[article.id] || [];
      });
    }

    return NextResponse.json({ 
      articles,
      total: count || 0,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('[Articles API] GET Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles?slug=xxx
 * Delete an article
 * 
 * Authentication: Required (API Key or Admin User Session)
 * Rate Limit: 50 requests per minute
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authentication check
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can delete
    if (auth.user?.type === 'user' && auth.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin permissions required to delete articles' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIp, 50, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('Article')
      .delete()
      .eq('slug', slug);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: slug });
  } catch (error: any) {
    console.error('[Articles API] DELETE Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
