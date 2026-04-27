#!/usr/bin/env node
/**
 * Audit and clean dirty article content in the database.
 *
 * Scans all articles for:
 * - Markdown leakage (anchor links, * * *, ---, etc.)
 * - Promotional / GitHub README content
 * - Excessive emoji usage
 * - Unusually short content
 *
 * Usage:
 *   npx tsx scripts/audit-and-clean-articles.ts --dry-run     # show issues only
 *   npx tsx scripts/audit-and-clean-articles.ts --clean       # auto-clean fixable issues
 *   npx tsx scripts/audit-and-clean-articles.ts --delete      # delete articles with unfixable issues
 */

import { createClient } from '@supabase/supabase-js';
import {
  validateArticleContent,
  cleanMarkdownArtifacts,
} from '../lib/content-validator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: !args.includes('--clean') && !args.includes('--delete'),
    clean: args.includes('--clean'),
    deleteBad: args.includes('--delete'),
  };
}

async function auditAndClean() {
  const { dryRun, clean, deleteBad } = parseArgs();

  console.log(`🔍 Audit mode: ${dryRun ? 'DRY RUN (no changes)' : clean ? 'AUTO-CLEAN' : 'DELETE BAD'}`);
  console.log('─'.repeat(60));

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, sourceSite, status, isPublished');

  if (error) {
    console.error(`❌ Failed to fetch articles: ${error.message}`);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No articles found.');
    return;
  }

  console.log(`📊 Found ${articles.length} articles to audit.\n`);

  let totalClean = 0;
  let totalIssues = 0;
  let totalAutoCleaned = 0;
  let totalDeleted = 0;

  for (const article of articles) {
    const validation = validateArticleContent(article.contentEn, {
      strict: true,
      autoClean: clean,
      checkSource: true,
      sourceSite: article.sourceSite,
    });

    if (validation.valid && validation.warnings.length === 0) {
      totalClean++;
      continue;
    }

    totalIssues++;
    console.log(`\n⚠️  [${article.slug}] "${article.titleEn}"`);
    console.log(`   Source: ${article.sourceSite || 'unknown'} | Status: ${article.status}`);

    if (validation.errors.length > 0) {
      console.log(`   ❌ Errors:`);
      for (const e of validation.errors) {
        console.log(`      - ${e}`);
      }
    }

    if (validation.warnings.length > 0) {
      console.log(`   ⚠️  Warnings:`);
      for (const w of validation.warnings) {
        console.log(`      - ${w}`);
      }
    }

    // ── Auto-clean fixable issues ──────────────────────────────────────
    if (clean && validation.cleanedContent && validation.errors.length === 0) {
      const { error: updateError } = await supabase
        .from('Article')
        .update({ contentEn: validation.cleanedContent })
        .eq('id', article.id);

      if (updateError) {
        console.log(`   ❌ Failed to clean: ${updateError.message}`);
      } else {
        totalAutoCleaned++;
        console.log(`   ✅ Auto-cleaned (${article.contentEn.length} → ${validation.cleanedContent.length} chars)`);
      }
      continue;
    }

    // ── Delete articles with unfixable issues ──────────────────────────
    if (deleteBad && validation.errors.length > 0) {
      // Also delete translations
      const { error: transError } = await supabase
        .from('ArticleTranslation')
        .delete()
        .eq('articleId', article.id);

      if (transError) {
        console.log(`   ⚠️  Failed to delete translations: ${transError.message}`);
      }

      const { error: deleteError } = await supabase
        .from('Article')
        .delete()
        .eq('id', article.id);

      if (deleteError) {
        console.log(`   ❌ Failed to delete: ${deleteError.message}`);
      } else {
        totalDeleted++;
        console.log(`   🗑️  Deleted article + translations`);
      }
      continue;
    }

    // ── Dry run: suggest action ────────────────────────────────────────
    if (dryRun) {
      if (validation.errors.length > 0) {
        console.log(`   💡 Action: delete (unfixable errors)`);
      } else if (validation.warnings.length > 0) {
        console.log(`   💡 Action: run with --clean to auto-fix`);
      }
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`📋 Summary:`);
  console.log(`   Total articles:    ${articles.length}`);
  console.log(`   Clean:             ${totalClean}`);
  console.log(`   With issues:       ${totalIssues}`);
  if (clean) console.log(`   Auto-cleaned:      ${totalAutoCleaned}`);
  if (deleteBad) console.log(`   Deleted:           ${totalDeleted}`);
  if (dryRun && totalIssues > 0) {
    console.log(`\n   💡 Run with --clean to auto-fix Markdown artifacts`);
    console.log(`   💡 Run with --delete to remove articles with unfixable issues`);
  }
}

auditAndClean().catch(console.error);
