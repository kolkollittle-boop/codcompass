/**
 * 蜂群批量重构脚本
 * 
 * 用法: npx tsx src/hive-restructure-batch.ts <batchIndex> <totalBatches>
 * 例如: npx tsx src/hive-restructure-batch.ts 1 5  (5个Agent中的第1个)
 * 
 * 每个 Agent 处理不重叠的文章分片，避免冲突
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { restructureArticle } from './article-restructurer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_INDEX = parseInt(process.argv[2] || '1', 10);
const TOTAL_BATCHES = parseInt(process.argv[3] || '5', 10);

function isRestructured(contentEn: string | null): boolean {
  if (!contentEn) return false;
  const markers = [
    'Current Situation Analysis', 'WOW Moment', 'Core Solution',
    'Pitfall Guide', 'Production Bundle', '## Current Situation',
    '## WOW Moment', '## Core Solution', '## Pitfall',
  ];
  return markers.some(m => contentEn.includes(m));
}

function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
  if (plainText.length <= maxLength) return plainText;
  const truncated = plainText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'),
  );
  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  return truncated + '...';
}

async function main() {
  const startTime = Date.now();
  console.log(`🚀 [Agent ${BATCH_INDEX}/${TOTAL_BATCHES}] 蜂群重构任务启动`);
  console.log(`⏰ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);

  // 查询所有 REVIEW 中 qualityScore >= 60 的文章
  const { data: reviewArticles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails, originalUrl, sourceSite, sourceAuthor, crawledAt')
    .eq('status', 'REVIEW')
    .gte('qualityScore', 60)
    .order('qualityScore', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }

  if (!reviewArticles || reviewArticles.length === 0) {
    console.log('✅ 没有需要处理的文章');
    return;
  }

  // 按 Agent 分片，不重叠
  const totalArticles = reviewArticles.length;
  const chunkSize = Math.ceil(totalArticles / TOTAL_BATCHES);
  const startIdx = (BATCH_INDEX - 1) * chunkSize;
  const endIdx = Math.min(startIdx + chunkSize, totalArticles);
  const myArticles = reviewArticles.slice(startIdx, endIdx);

  if (myArticles.length === 0) {
    console.log(`✅ [Agent ${BATCH_INDEX}] 当前分片无文章`);
    return;
  }

  console.log(`📋 总共 ${totalArticles} 篇，[Agent ${BATCH_INDEX}] 分片: ${startIdx}-${endIdx - 1}，共 ${myArticles.length} 篇`);
  console.log('');

  let successCount = 0;
  let restructuredCount = 0;
  let directPushCount = 0;
  let failedCount = 0;

  for (let i = 0; i < myArticles.length; i++) {
    const article = myArticles[i];
    console.log(`[${i + 1}/${myArticles.length}] ${(article.titleEn || '无标题').slice(0, 80)}`);
    console.log(`  分数: ${article.qualityScore}`);

    try {
      if (isRestructured(article.contentEn)) {
        console.log('  ✅ 已重构，直接发布');
        const { error: updateError } = await supabase
          .from('Article')
          .update({
            status: 'PUBLISHED',
            isPublished: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`  ❌ ${updateError.message}`);
          failedCount++;
        } else {
          directPushCount++;
          successCount++;
        }
      } else {
        console.log('  🔄 AI 重构中...');
        const evaluation = article.qualityDetails || { difficulty_level: 'L2' };

        try {
          const restructured = await restructureArticle(
            article.titleEn || '',
            article.contentEn || '',
            evaluation
          );

          const hasStructure = restructured.content.includes('Current Situation') ||
                               restructured.content.includes('WOW Moment') ||
                               restructured.content.includes('Core Solution');

          if (!hasStructure && restructured.content.length < 500) {
            console.log('  ⚠️ 重构结果不理想，留在 REVIEW');
            failedCount++;
            continue;
          }

          const updateData: any = {
            status: 'PUBLISHED',
            isPublished: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            titleEn: restructured.title,
            contentEn: restructured.content,
            descriptionEn: generateExcerpt(restructured.content, 300),
            excerptEn: restructured.excerpt,
            difficultyLevel: restructured.difficultyLevel,
            readingTime: restructured.readingTimeMinutes,
            expectedOutcome: restructured.expectedOutcome,
          };

          if (restructured.tags?.length) {
            updateData.qualityDetails = { ...evaluation, tags: restructured.tags };
          }

          const { error: updateError } = await supabase
            .from('Article')
            .update(updateData)
            .eq('id', article.id);

          if (updateError) {
            console.error(`  ❌ ${updateError.message}`);
            failedCount++;
          } else {
            console.log(`  🎉 已发布 (${restructured.content.length} 字)`);
            restructuredCount++;
            successCount++;
          }
        } catch (e: any) {
          console.log('  ⛔ 重构失败，留在 REVIEW');
          failedCount++;
        }
      }
    } catch (e: any) {
      console.error(`  ❌ ${e?.message?.slice(0, 100) || 'error'}`);
      failedCount++;
    }

    // API 限流保护
    if (i < myArticles.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log(`════════ [Agent ${BATCH_INDEX}/${TOTAL_BATCHES}] 完成 ════════`);
  console.log(`⏱️  ${elapsed}s | ✅ ${successCount} (重构${restructuredCount}+直接${directPushCount}) | ❌ ${failedCount}`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥', err);
  process.exit(1);
});
