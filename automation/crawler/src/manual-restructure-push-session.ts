/**
 * 手动重构+推送 - 增强版（更大超时，更稳）
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
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
  );
  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  return truncated + '...';
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 手动重构+推送任务启动');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // Query REVIEW articles with qualityScore >= 65
  const { data: reviewArticles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails, originalUrl, sourceSite, sourceAuthor, crawledAt')
    .eq('status', 'REVIEW')
    .gte('qualityScore', 65)
    .order('qualityScore', { ascending: false });

  if (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }

  // Also check today's PUBLISHED articles that are not restructured
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: publishedArticles, error: pubError } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails, originalUrl, sourceSite, sourceAuthor, crawledAt')
    .eq('status', 'PUBLISHED')
    .gte('qualityScore', 65)
    .gte('publishedAt', todayStart.toISOString())
    .order('qualityScore', { ascending: false });

  if (pubError) {
    console.error('❌ 查询已发布文章失败:', pubError.message);
  }

  const unstructuredPublished = (publishedArticles || []).filter(a => {
    const qd = a.qualityDetails;
    return !(qd && typeof qd === 'object' && qd.restructured === true);
  });

  const allArticles = [...(reviewArticles || []), ...unstructuredPublished];

  if (allArticles.length === 0) {
    console.log('✅ 没有需要处理的文章');
    return;
  }

  console.log(`📋 找到 ${reviewArticles?.length || 0} 篇 REVIEW 待处理`);
  console.log(`📋 找到 ${unstructuredPublished.length} 篇已发布但未重构`);
  console.log(`📋 总计: ${allArticles.length} 篇待处理`);
  console.log('');

  let successCount = 0;
  let restructuredCount = 0;
  let directPushCount = 0;
  let failedCount = 0;
  const failedTitles: string[] = [];
  const successTitles: string[] = [];

  for (let i = 0; i < allArticles.length; i++) {
    const article = allArticles[i];
    const idx = i + 1;
    const title = article.titleEn?.slice(0, 80) || '无标题';
    console.log(`\n[${idx}/${allArticles.length}] 处理: ${title}`);
    console.log(`  分数: ${article.qualityScore} | ID: ${article.id.slice(0, 8)}`);

    try {
      if (isRestructured(article.contentEn)) {
        console.log('  ✅ 已重构，直接推送');
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
          console.error(`  ❌ 更新失败: ${updateError.message}`);
          failedCount++;
          failedTitles.push(title);
        } else {
          console.log('  🎉 已发布');
          directPushCount++;
          successCount++;
          successTitles.push(title);
        }
      } else {
        console.log('  🔄 未重构，调用 AI 重构...');
        const evaluation = article.qualityDetails || { difficulty_level: 'L2' };

        try {
          const restructured = await restructureArticle(
            article.titleEn || '',
            article.contentEn || '',
            evaluation
          );

          const updateData: Record<string, unknown> = {
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

          if (restructured.tags && restructured.tags.length > 0) {
            (updateData as any).qualityDetails = {
              ...evaluation,
              tags: restructured.tags,
            };
          }

          const { error: updateError } = await supabase
            .from('Article')
            .update(updateData)
            .eq('id', article.id);

          if (updateError) {
            console.error(`  ❌ 更新失败: ${updateError.message}`);
            failedCount++;
            failedTitles.push(title);
          } else {
            console.log(`  🎉 已重构并发布 (${restructured.content.length} 字)`);
            restructuredCount++;
            successCount++;
            successTitles.push(restructured.title?.slice(0, 80) || title);
          }
        } catch (restructureError) {
          console.error(`  ❌ 重构失败: ${(restructureError as Error).message.slice(0, 150)}`);
          // Fallback: publish as-is
          const { error: fallbackError } = await supabase
            .from('Article')
            .update({
              status: 'PUBLISHED',
              isPublished: true,
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .eq('id', article.id);

          if (fallbackError) {
            console.error(`  ❌ fallback 也失败: ${fallbackError.message}`);
            failedCount++;
            failedTitles.push(title);
          } else {
            console.log('  ⚠️ 重构失败，使用原文直接发布');
            failedCount++;
            successCount++;
            successTitles.push(title + ' (fallback)');
          }
        }
      }
    } catch (err) {
      console.error(`  ❌ 处理异常: ${(err as Error).message.slice(0, 150)}`);
      failedCount++;
      failedTitles.push(title);
    }

    // 间隔避免 API 限流
    if (i < allArticles.length - 1) {
      console.log('  ⏳ 等待 3 秒...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 Codcompass 自动重构推送报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒 (${(Number(elapsed) / 60).toFixed(1)} 分钟)`);
  console.log(`📋 待处理: ${allArticles.length} 篇`);
  console.log(`✅ 成功发布: ${successCount} 篇`);
  console.log(`  🔄 AI 重构: ${restructuredCount} 篇`);
  console.log(`  📤 直接推送: ${directPushCount} 篇`);
  console.log(`❌ 失败: ${failedCount} 篇`);
  if (failedTitles.length > 0) {
    console.log('\n失败文章:');
    failedTitles.forEach(t => console.log(`  - ${t.slice(0, 70)}`));
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
