#!/usr/bin/env node
/**
 * 批量重构今天发布的文章（v3 版权安全版）
 * 
 * 问题：今天发布的 502 篇文章全部未重构
 * 原因：BLOG 类型文章不经过重构直接发布
 * 修复：修改 run.ts 让 BLOG 也走重构，然后批量重构历史文章
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { restructureArticle } from './article-restructurer.js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🚀 批量重构今天发布的文章...');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // 查询今天发布的未重构文章
  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails, sourceSite, crawledAt')
    .eq('status', 'PUBLISHED')
    .gte('publishedAt', '2026-05-09T00:00:00Z')
    .is('qualityDetails->restructured', true)
    .order('publishedAt', { ascending: false });

  if (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }

  // 过滤掉已重构的文章
  const unstructured = (articles || []).filter(a => {
    const qd = a.qualityDetails;
    return !(qd && typeof qd === 'object' && qd.restructured === true);
  });

  console.log(`📋 找到 ${unstructured.length} 篇待重构文章`);
  console.log('');

  if (unstructured.length === 0) {
    console.log('✅ 没有需要重构的文章');
    return;
  }

  let successCount = 0;
  let failedCount = 0;
  const failedTitles: string[] = [];

  for (let i = 0; i < unstructured.length; i++) {
    const article = unstructured[i];
    const idx = i + 1;
    console.log(`[${idx}/${unstructured.length}] 重构: ${article.titleEn?.slice(0, 80) || '无标题'}`);

    try {
      const evaluation = article.qualityDetails || { difficulty_level: 'L2' };
      const restructured = await restructureArticle(
        article.titleEn || '',
        article.contentEn || '',
        evaluation
      );

      // 更新文章
      const { error: updateError } = await supabase
        .from('Article')
        .update({
          titleEn: restructured.title,
          contentEn: restructured.content,
          qualityDetails: {
            ...evaluation,
            restructured: true,
            restructuredAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  ❌ 更新失败: ${updateError.message}`);
        failedCount++;
        failedTitles.push(article.titleEn || '无标题');
      } else {
        console.log(`  ✅ 已重构 (${restructured.content.length} 字)`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ 重构失败: ${(err as Error).message.slice(0, 150)}`);
      failedCount++;
      failedTitles.push(article.titleEn || '无标题');
    }

    // 间隔避免 API 限流
    if (i < unstructured.length - 1) {
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // 汇总报告
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 批量重构完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`📋 待重构: ${unstructured.length} 篇`);
  console.log(`✅ 成功: ${successCount} 篇`);
  console.log(`❌ 失败: ${failedCount} 篇`);
  if (failedTitles.length > 0) {
    console.log('失败文章:');
    failedTitles.slice(0, 10).forEach(t => console.log(`  - ${t.slice(0, 60)}`));
    if (failedTitles.length > 10) console.log(`  ... 还有 ${failedTitles.length - 10} 篇`);
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
