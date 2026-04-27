/**
 * Article Writer — unified pipeline for inserting articles into the database
 *
 * Pipeline: validate → auto-clean → generate slug → match category → insert → link → translate
 *
 * Used by: crawl scripts, API endpoints, manual article creation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { validateArticleContent, validateArticleMetadata, cleanMarkdownArtifacts } from './content-validator';
import { generateSlug, matchCategory, CategoryInfo } from './content-extractor';

export interface ArticleInput {
  titleEn: string;
  contentEn: string;          // Must be HTML
  excerptEn?: string;
  originalUrl?: string;
  sourceSite?: string;
  sourceAuthor?: string;
  publishedDate?: string | null;
  tags?: string[];
  featuredImage?: string | null;
  categorySlug?: string | null;  // Auto-matched if not provided
  isPremium?: boolean;
  isPublished?: boolean;
  qualityScore?: number;
}

export interface ArticleWriteResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  categorySlug?: string | null;
  errors: string[];
  warnings: string[];
}

interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
}

// ── Supabase client (lazy init) ─────────────────────────────────────────────

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// ── Main Write Pipeline ─────────────────────────────────────────────────────

export async function writeArticle(
  input: ArticleInput,
  options: {
    supabase?: SupabaseClient;
    strict?: boolean;
    autoClean?: boolean;
    autoCategorize?: boolean;
    categories?: CategoryInfo[];
    skipIfExists?: boolean;
  } = {}
): Promise<ArticleWriteResult> {
  const {
    supabase: providedClient,
    strict = true,
    autoClean = true,
    autoCategorize = true,
    categories,
    skipIfExists = true,
  } = options;

  const db = providedClient || getSupabase();
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── Step 1: Validate metadata ──────────────────────────────────────────
  const metaValidation = validateArticleMetadata({
    slug: generateSlug(input.titleEn),
    titleEn: input.titleEn,
    contentEn: input.contentEn,
  });

  if (!metaValidation.valid) {
    return { success: false, errors: metaValidation.errors, warnings: metaValidation.warnings };
  }

  if (metaValidation.warnings.length > 0) {
    warnings.push(...metaValidation.warnings);
  }

  // ── Step 2: Validate and clean content ─────────────────────────────────
  let content = input.contentEn;
  const contentValidation = validateArticleContent(content, {
    strict,
    autoClean,
    checkSource: true,
    sourceSite: input.sourceSite,
  });

  if (!contentValidation.valid) {
    return {
      success: false,
      errors: contentValidation.errors,
      warnings: contentValidation.warnings,
    };
  }

  if (contentValidation.cleanedContent) {
    content = contentValidation.cleanedContent;
    warnings.push('Content was auto-cleaned');
  }

  if (contentValidation.warnings.length > 0) {
    warnings.push(...contentValidation.warnings);
  }

  // ── Step 3: Generate slug ──────────────────────────────────────────────
  const slug = generateSlug(input.titleEn);

  // Check if article already exists
  if (skipIfExists) {
    const { data: existing } = await db
      .from('Article')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      warnings.push(`Article already exists with slug: ${slug}`);
      return {
        success: false,
        articleId: existing.id,
        slug,
        errors: ['Article already exists'],
        warnings,
      };
    }
  }

  // ── Step 4: Auto-categorize if needed ──────────────────────────────────
  let categorySlug = input.categorySlug;

  if (autoCategorize && !categorySlug && categories) {
    categorySlug = matchCategory(input.titleEn, content, categories);
    if (categorySlug) {
      warnings.push(`Auto-matched category: ${categorySlug}`);
    }
  }

  // ── Step 5: Insert article ─────────────────────────────────────────────
  const now = new Date().toISOString();
  const articleId = crypto.randomUUID();

  const { data: newArticle, error: insertError } = await db
    .from('Article')
    .insert({
      id: articleId,
      slug,
      titleEn: input.titleEn,
      contentEn: content,
      excerptEn: input.excerptEn || generateExcerpt(content),
      originalUrl: input.originalUrl || null,
      sourceSite: input.sourceSite || null,
      sourceAuthor: input.sourceAuthor || null,
      crawledAt: input.publishedDate || new Date().toISOString(),
      isPremium: input.isPremium ?? false,
      isPublished: input.isPublished ?? true,
      status: (input.isPublished ?? true) ? 'PUBLISHED' : 'DRAFT',
      publishedAt: input.isPublished ? now : null,
      qualityScore: input.qualityScore || null,
      createdAt: now,
      updatedAt: now,
    })
    .select('id')
    .single();

  if (insertError) {
    errors.push(`Database insert failed: ${insertError.message}`);
    return { success: false, errors, warnings };
  }

  // ── Step 6: Link to category ───────────────────────────────────────────
  if (categorySlug) {
    const { data: category } = await db
      .from('Category')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (category) {
      await db.from('_ArticleToCategory').insert({
        A: newArticle.id,
        B: category.id,
      });
    } else {
      warnings.push(`Category "${categorySlug}" not found in database`);
    }
  }

  // ── Step 7: Create translation placeholder ─────────────────────────────
  const translationNow = new Date().toISOString();
  await db.from('ArticleTranslation').insert({
    id: crypto.randomUUID(),
    articleId: newArticle.id,
    locale: 'zh',
    title: input.titleEn, // Same as English until translated
    content: content,     // Same as English until translated
    excerpt: input.excerptEn || generateExcerpt(content),
    isAutoTranslated: true,
    isReviewed: false,
    translatedAt: translationNow,
    updatedAt: translationNow,
  });

  // ── Step 8: Insert tags if provided ────────────────────────────────────
  if (input.tags && input.tags.length > 0) {
    for (const tagName of input.tags) {
      const tagSlug = generateSlug(tagName);

      // Find or create tag
      let { data: tag } = await db
        .from('Tag')
        .select('id')
        .eq('slug', tagSlug)
        .single();

      if (!tag) {
        const { data: newTag } = await db
          .from('Tag')
          .insert({
            id: crypto.randomUUID(),
            slug: tagSlug,
            name: tagName,
            nameEn: tagName,
            usageCount: 1,
          })
          .select('id')
          .single();
        tag = newTag;
      } else {
        // Increment usage count
        await db
          .from('Tag')
          .update({ usageCount: (tag as any).usageCount + 1 })
          .eq('id', tag.id);
      }

      if (tag) {
        await db.from('_ArticleToTag').insert({
          A: newArticle.id,
          B: tag.id,
        });
      }
    }
  }

  return {
    success: true,
    articleId: newArticle.id,
    slug,
    categorySlug,
    errors: [],
    warnings,
  };
}

// ── Batch Write ─────────────────────────────────────────────────────────────

export async function writeArticlesBatch(
  inputs: ArticleInput[],
  options?: {
    supabase?: SupabaseClient;
    strict?: boolean;
    autoClean?: boolean;
    autoCategorize?: boolean;
    categories?: CategoryInfo[];
    concurrency?: number;
  }
): Promise<ArticleWriteResult[]> {
  const { concurrency = 3 } = options || {};
  const results: ArticleWriteResult[] = [];

  // Process in batches to avoid overwhelming the database
  for (let i = 0; i < inputs.length; i += concurrency) {
    const batch = inputs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((input) => writeArticle(input, options))
    );
    results.push(...batchResults);
  }

  return results;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateExcerpt(content: string, maxLength: number = 200): string {
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s\w+$/, '') + '...';
}
