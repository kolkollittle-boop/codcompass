/**
 * 修复文章问题：
 * 1. 删除重复标题文章（保留最新的一篇）
 * 2. 批量去除正文开头的 # 标题前缀
 * 
 * 使用方式：
 *   cd /Users/kol/Desktop/cyberpunkweb && npx tsx scripts/fix-article-issues.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔧 文章问题修复');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  const { data: articles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, slug, status, createdAt')
    .eq('status', 'PUBLISHED');

  if (!articles || articles.length === 0) {
    console.log('✅ 没有文章');
    return;
  }

  // ── 修复 1：删除重复标题文章 ──────────────────────────
  console.log('📋 修复 1: 删除重复标题文章');
  const titleMap: Record<string, typeof articles> = {};
  for (const a of articles) {
    if (!titleMap[a.titleEn]) titleMap[a.titleEn] = [];
    titleMap[a.titleEn].push(a);
  }

  let deletedCount = 0;
  for (const [title, entries] of Object.entries(titleMap)) {
    if (entries.length <= 1) continue;
    // 保留最新的（按 createdAt 排序）
    const sorted = [...entries].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const keep = sorted[0];
    const remove = sorted.slice(1);

    for (const article of remove) {
      const { error } = await supabase.from('Article').delete().eq('id', article.id);
      if (error) {
        console.log(`  ❌ 删除失败: "${title.slice(0, 60)}" - ${error.message}`);
      } else {
        deletedCount++;
        console.log(`  🗑️ 删除: "${title.slice(0, 60)}" (${article.sourceSite || 'unknown'})`);
      }
    }
    console.log(`  ✅ 保留最新: "${title.slice(0, 60)}" (${keep.createdAt})`);
  }
  console.log(`   删除了 ${deletedCount} 篇重复文章\n`);

  // ── 修复 2：去除正文开头的 # 标题 ─────────────────────
  console.log('📋 修复 2: 批量去除正文开头的标题');
  let fixedCount = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const updates: { id: string; contentEn: string }[] = [];

    for (const article of batch) {
      if (!article.contentEn || !article.titleEn) continue;

      const trimmed = article.contentEn.trim();
      let newContent: string | null = null;

      // 检查内容开头是否有 # 标题
      if (trimmed.startsWith('# ' + article.titleEn + '\n')) {
        // # Title\n\n## Current...
        newContent = trimmed.substring(article.titleEn.length + 2).trim();
      } else if (trimmed.startsWith('# ' + article.titleEn)) {
        // # Title## Current... (no newline)
        newContent = trimmed.substring(article.titleEn.length + 2).trim();
      } else if (trimmed.startsWith('## ' + article.titleEn + '\n')) {
        // ## Title\n\n## Current...
        newContent = trimmed.substring(article.titleEn.length + 3).trim();
      }

      if (newContent && newContent.length > 100) {
        updates.push({ id: article.id, contentEn: newContent });
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        const { error } = await supabase
          .from('Article')
          .update({ contentEn: update.contentEn, updatedAt: new Date().toISOString() })
          .eq('id', update.id);

        if (error) {
          console.log(`  ❌ 更新失败: ${update.id.slice(0, 8)} - ${error.message}`);
        } else {
          fixedCount++;
        }
      }
      console.log(`  ✅ 修复 [${i + 1}-${i + batch.length}/${articles.length}] (${updates.length} 篇)`);
    }
  }

  console.log(`\n   修复了 ${fixedCount} 篇文章的标题前缀\n`);

  // ── 汇总报告 ─────────────────────────────────────────
  console.log('═══════════════════════════════════════════');
  console.log('📊 修复完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`📋 总文章数: ${articles.length} 篇`);
  console.log(`🗑️  删除重复: ${deletedCount} 篇`);
  console.log(`✂️  去除标题前缀: ${fixedCount} 篇`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
