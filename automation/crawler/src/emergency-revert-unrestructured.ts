/**
 * 紧急回滚：将所有未重构的文章从 PUBLISHED 回滚到 REVIEW
 * 
 * 铁律：未重构绝不发布
 * 
 * 回滚标准：
 * 1. 不包含 Codcompass 2.0 结构标记
 * 2. editedAt 为 null（从未被编辑过）
 * 3. 或者是 ai-deep-generated / ai-generated 来源但无重构标记
 * 
 * 使用方式：
 *   cd automation/crawler && npx tsx src/emergency-revert-unrestructured.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 检测是否已重构（包含 Codcompass 2.0 结构标记）
function isRestructured(contentEn: string | null): boolean {
  if (!contentEn) return false;
  const markers = [
    'Current Situation Analysis',
    'WOW Moment',
    'Core Solution',
    'Pitfall Guide',
    'Production Bundle',
    '## Current Situation',
    '## WOW Moment',
    '## Core Solution',
    '## Pitfall',
    'Codcompass',
    'Learning Path',
    'Key Concepts',
    'Hands-on',
    'What You\'ll Learn',
    'Difficulty',
    '难度等级',
    '学习路径',
    '核心概念',
    '实践项目',
    '学习收获',
  ];
  return markers.some(m => contentEn.includes(m));
}

// 可疑标题模式（说明文章没有经过标题优化）
function hasSuspiciousTitle(titleEn: string): boolean {
  const patterns = [
    /^Backfill Article/i,
    /^Configuration$/i,
    /^### \[\(#/i,
    /^run `npx proof/i,
  ];
  return patterns.some(p => p.test(titleEn));
}

async function main() {
  console.log('🚨 紧急回滚：未重构文章回滚到 REVIEW');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // 查询所有已发布的文章
  const { data: articles, error: queryError } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, status, sourceSite, editedAt, publishedAt, qualityScore')
    .eq('isPublished', true);

  if (queryError) {
    console.error('❌ 查询失败:', queryError.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ 没有已发布的文章');
    return;
  }

  console.log(`📋 已发布文章总数: ${articles.length} 篇`);
  console.log('');

  // 筛选出需要回滚的文章
  const toRevert = articles.filter(a => {
    // 如果已经重构，保留
    if (isRestructured(a.contentEn)) return false;
    // 如果从未编辑过，回滚
    if (!a.editedAt) return true;
    // 如果标题可疑，回滚
    if (hasSuspiciousTitle(a.titleEn)) return true;
    // 如果是 AI 生成但无重构标记，回滚
    if (a.sourceSite === 'ai-generated' || a.sourceSite === 'ai-deep-generated') return true;
    // 内容太短（< 1500 chars），可能是解析错误
    if ((a.contentEn?.length ?? 0) < 1500) return true;
    return false;
  });

  const toKeep = articles.length - toRevert.length;
  console.log(`⚠️  需要回滚: ${toRevert.length} 篇`);
  console.log(`✅ 确认保留: ${toKeep} 篇`);
  console.log('');

  if (toRevert.length === 0) {
    console.log('✅ 所有已发布文章都已通过重构，无需回滚');
    return;
  }

  // 显示前 10 篇待回滚的文章
  console.log('📋 待回滚文章（前 10 篇）:');
  for (const a of toRevert.slice(0, 10)) {
    const reasons = [];
    if (!isRestructured(a.contentEn)) reasons.push('无重构标记');
    if (!a.editedAt) reasons.push('从未编辑');
    if (hasSuspiciousTitle(a.titleEn)) reasons.push('标题可疑');
    if (a.sourceSite === 'ai-generated' || a.sourceSite === 'ai-deep-generated') reasons.push('AI生成未重构');
    if ((a.contentEn?.length ?? 0) < 1500) reasons.push('内容太短');
    console.log(`  - ${a.titleEn.substring(0, 60)}`);
    console.log(`    Slug: ${a.slug} | 原因: ${reasons.join(', ')}`);
  }
  if (toRevert.length > 10) {
    console.log(`  ... 还有 ${toRevert.length - 10} 篇`);
  }
  console.log('');

  // 批量回滚，每批 50 条
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toRevert.length; i += BATCH_SIZE) {
    const batch = toRevert.slice(i, i + BATCH_SIZE);
    const ids = batch.map(a => a.id);

    const { error: updateError } = await supabase
      .from('Article')
      .update({
        status: 'REVIEW',
        isPublished: false,
        publishedAt: null,
        updatedAt: new Date().toISOString(),
        qualityDetails: {
          reverted_by: 'emergency-revert-unrestructured',
          reverted_at: new Date().toISOString(),
          reason: '铁律：未重构绝不发布 - 自动回滚',
          original_published_at: batch.map(a => ({ id: a.id, publishedAt: a.publishedAt })),
        },
      })
      .in('id', ids);

    if (updateError) {
      console.error(`❌ 批量回退失败 [${i}-${i + batch.length}]: ${updateError.message}`);
      failCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✅ 回退 [${i + 1}-${i + batch.length}/${toRevert.length}]`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 回滚完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`📋 已发布文章总数: ${articles.length} 篇`);
  console.log(`✅ 确认保留（已重构）: ${toKeep} 篇`);
  console.log(`🔄 成功回滚 REVIEW: ${successCount} 篇`);
  console.log(`❌ 回滚失败: ${failCount} 篇`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('⚠️  下一步：');
  console.log('  1. 运行 auto-restructure-push.ts 重新处理回滚的文章');
  console.log('  2. 修复 deep-regenerate-ai-articles.ts，禁止直接发布');
  console.log('  3. 运行 quality-check-ai-articles.ts 检查现有文章质量');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
