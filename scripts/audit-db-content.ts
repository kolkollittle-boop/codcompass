#!/usr/bin/env node
/**
 * Database Content Audit & Clean Script
 *
 * Scans all published articles in the database and flags:
 * - Promotional / ad content
 * - Markdown leakage
 * - Security issues
 * - Low-quality content
 *
 * Usage:
 *   npx tsx scripts/audit-db-content.ts              # Dry run (report only)
 *   npx tsx scripts/audit-db-content.ts --clean      # Auto-fix fixable issues
 *   npx tsx scripts/audit-db-content.ts --delete     # Delete flagged articles
 */

import { createClient } from '@supabase/supabase-js';
import { validateArticleContent, cleanMarkdownArtifacts } from '../lib/content-validator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekunyyscyqhasolbbohw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AuditResult {
  id: string;
  slug: string;
  titleEn: string;
  sourceSite: string | null;
  issues: string[];
  severity: 'critical' | 'warning' | 'ok';
}

async function fetchAllArticles() {
  const { data, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, sourceSite')
    .eq('isPublished', true)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    process.exit(1);
  }

  return data || [];
}

async function auditArticles(articles: any[]): Promise<AuditResult[]> {
  const results: AuditResult[] = [];

  console.log(`\n🔍 Auditing ${articles.length} articles...\n`);

  for (const article of articles) {
    const validation = validateArticleContent(article.contentEn, {
      strict: true,
      autoClean: false,
      checkSource: true,
      sourceSite: article.sourceSite || undefined,
    });

    if (!validation.valid || validation.warnings.length > 0) {
      const issues = [...validation.errors.map(e => `❌ ${e}`), ...validation.warnings.map(w => `⚠️ ${w}`)];
      const hasErrors = validation.errors.length > 0;

      results.push({
        id: article.id,
        slug: article.slug,
        titleEn: article.titleEn,
        sourceSite: article.sourceSite,
        issues,
        severity: hasErrors ? 'critical' : 'warning',
      });
    }
  }

  return results;
}

function printReport(results: AuditResult[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 CONTENT AUDIT REPORT');
  console.log('='.repeat(80));

  if (results.length === 0) {
    console.log('\n✅ All articles passed validation!');
    return;
  }

  const critical = results.filter(r => r.severity === 'critical').length;
  const warnings = results.filter(r => r.severity === 'warning').length;

  console.log(`\nTotal flagged: ${results.length}`);
  console.log(`  Critical: ${critical}`);
  console.log(`  Warnings: ${warnings}`);

  console.log('\n' + '-'.repeat(80));

  // Print critical first
  for (const result of results.filter(r => r.severity === 'critical')) {
    console.log(`\n🚨 [CRITICAL] ${result.titleEn}`);
    console.log(`   Slug: ${result.slug}`);
    console.log(`   Source: ${result.sourceSite || 'unknown'}`);
    console.log(`   Issues:`);
    for (const issue of result.issues) {
      console.log(`     ${issue}`);
    }
  }

  // Print warnings
  for (const result of results.filter(r => r.severity === 'warning')) {
    console.log(`\n⚠️ [WARNING] ${result.titleEn}`);
    console.log(`   Slug: ${result.slug}`);
    console.log(`   Source: ${result.sourceSite || 'unknown'}`);
    console.log(`   Issues:`);
    for (const issue of result.issues) {
      console.log(`     ${issue}`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

async function cleanArticles(results: AuditResult[]) {
  const criticalResults = results.filter(r => r.severity === 'critical');

  if (criticalResults.length === 0) {
    console.log('\n✅ No critical issues to fix.');
    return;
  }

  console.log(`\n🧹 Attempting to auto-clean ${criticalResults.length} articles...\n`);

  let cleanedCount = 0;
  let failedCount = 0;

  for (const result of criticalResults) {
    // Try to clean markdown artifacts
    const { data: article } = await supabase
      .from('Article')
      .select('contentEn')
      .eq('id', result.id)
      .single();

    if (!article) continue;

    const cleaned = cleanMarkdownArtifacts(article.contentEn);

    // Re-validate after cleaning
    const validation = validateArticleContent(cleaned, { strict: true, autoClean: false });

    if (validation.valid) {
      await supabase
        .from('Article')
        .update({ contentEn: cleaned, updatedAt: new Date().toISOString() })
        .eq('id', result.id);

      console.log(`  ✅ Cleaned: ${result.titleEn}`);
      cleanedCount++;
    } else {
      console.log(`  ❌ Could not auto-clean: ${result.titleEn} (${validation.errors.join('; ')})`);
      failedCount++;
    }
  }

  console.log(`\nCleaned: ${cleanedCount}, Still problematic: ${failedCount}`);
}

async function deleteArticles(results: AuditResult[]) {
  const criticalResults = results.filter(r => r.severity === 'critical');

  if (criticalResults.length === 0) {
    console.log('\n✅ No critical articles to delete.');
    return;
  }

  console.log(`\n🗑️ Deleting ${criticalResults.length} critical articles...\n`);

  for (const result of criticalResults) {
    await supabase
      .from('Article')
      .delete()
      .eq('id', result.id);

    // Also delete translations
    await supabase
      .from('ArticleTranslation')
      .delete()
      .eq('articleId', result.id);

    console.log(`  🗑️ Deleted: ${result.titleEn} (${result.slug})`);
  }

  console.log(`\nDeleted ${criticalResults.length} articles.`);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');
  const shouldDelete = args.includes('--delete');

  console.log('📋 Database Content Audit');
  console.log(`   Mode: ${shouldDelete ? 'DELETE' : shouldClean ? 'CLEAN' : 'REPORT ONLY'}`);

  const articles = await fetchAllArticles();
  const results = await auditArticles(articles);

  printReport(results);

  if (shouldDelete) {
    await deleteArticles(results);
  } else if (shouldClean) {
    await cleanArticles(results);
  } else {
    console.log('\n💡 Run with --clean to auto-fix, or --delete to remove critical articles.');
  }
}

main().catch(console.error);
