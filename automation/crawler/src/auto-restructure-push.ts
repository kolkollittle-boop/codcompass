/**
 * 自动重构 + 推送任务
 * 
 * 功能：检查 REVIEW 状态中 qualityScore >= 65 的文章
 * - 已重构的：直接推送到 PUBLISHED
 * - 未重构的：调用 AI 重构后再推送到 PUBLISHED
 * 
 * 使用方式：
 *   cd automation/crawler && npx tsx src/auto-restructure-push.ts
 * 
 * 计划：每天 9:00 和 18:00 执行
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
  ];
  return markers.some(m => contentEn.includes(m));
}

// 检测是否含有中文字符
function hasChinese(text: string | null): boolean {
  if (!text) return false;
  return /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(text);
}

// 生成 excerpt
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

// 提取标签
function extractTags(content: string, title: string): string[] {
  const techKeywords = [
    'RAG', 'Agent', 'LLM', 'Vector DB', 'Embedding', 'Re-ranking',
    'React', 'Next.js', 'TypeScript', 'Python', 'Docker', 'Kubernetes',
    'API', 'Microservices', 'Serverless', 'CI/CD',
    'AI', 'Machine Learning', 'Deep Learning', 'Rust', 'Function',
  ];
  const tags: string[] = [];
  const text = `${title} ${content.substring(0, 2000)}`.toUpperCase();
  for (const keyword of techKeywords) {
    if (text.includes(keyword.toUpperCase()) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
    if (tags.length >= 5) break;
  }
  return tags;
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 自动重构+推送任务启动');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // 1. 查询 REVIEW 状态中 qualityScore >= 65 的文章
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

  if (!reviewArticles || reviewArticles.length === 0) {
    console.log('✅ 没有需要处理的文章');
    return;
  }

  console.log(`📋 找到 ${reviewArticles.length} 篇待处理文章 (qualityScore >= 65)`);
  console.log('');

  let successCount = 0;
  let restructuredCount = 0;
  let directPushCount = 0;
  let failedCount = 0;
  const failedTitles: string[] = [];

  for (let i = 0; i < reviewArticles.length; i++) {
    const article = reviewArticles[i];
    const idx = i + 1;
    console.log(`[${idx}/${reviewArticles.length}] 处理: ${article.titleEn?.slice(0, 80) || '无标题'}`);
    console.log(`  分数: ${article.qualityScore} | ID: ${article.id.slice(0, 8)}`);

    try {
      if (isRestructured(article.contentEn)) {
        // 已重构，直接推送
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
          failedTitles.push(article.titleEn || '无标题');
        } else {
          console.log('  🎉 已发布');
          directPushCount++;
          successCount++;
        }
      } else {
        // 未重构，调用 AI 重构
        console.log('  🔄 未重构，调用 AI 重构...');
        
        const hasChineseContent = hasChinese(article.contentEn);
        if (hasChineseContent) {
          console.log('  ⚠️ 检测到中文内容，将重构为纯英文');
        }

        const evaluation = article.qualityDetails || { difficulty_level: 'L2' };
        
        try {
          const restructured = await restructureArticle(
            article.titleEn || '',
            article.contentEn || '',
            evaluation
          );

          // 检查重构结果是否有效
          const hasStructure = restructured.content.includes('Current Situation') ||
                               restructured.content.includes('WOW Moment') ||
                               restructured.content.includes('Core Solution');

          if (!hasStructure && restructured.content.length < 500) {
            console.log('  ⚠️ 重构结果不理想，使用 fallback');
          }

          // 更新文章
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

          // 添加标签（如果 qualityDetails 中有 tags 字段）
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
            failedTitles.push(article.titleEn || '无标题');
          } else {
            console.log(`  🎉 已重构并发布 (${restructured.content.length} 字)`);
            restructuredCount++;
            successCount++;
          }
        } catch (restructureError) {
          console.error(`  ❌ 重构失败: ${(restructureError as Error).message.slice(0, 150)}`);
          
          // 重构失败也尝试直接发布（fallback 内容）
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
            console.error(`  ❌ fallback 发布也失败: ${fallbackError.message}`);
            failedCount++;
            failedTitles.push(article.titleEn || '无标题');
          } else {
            console.log('  ⚠️ 重构失败，使用原文直接发布');
            failedCount++; // 记为部分成功
            successCount++;
          }
        }
      }
    } catch (err) {
      console.error(`  ❌ 处理异常: ${(err as Error).message.slice(0, 150)}`);
      failedCount++;
      failedTitles.push(article.titleEn || '无标题');
    }

    // 间隔避免 API 限流
    if (i < reviewArticles.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // 汇总报告
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 任务完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒`);
  console.log(`📋 待处理: ${reviewArticles.length} 篇`);
  console.log(`✅ 成功发布: ${successCount} 篇`);
  console.log(`  🔄 AI 重构: ${restructuredCount} 篇`);
  console.log(`  📤 直接推送: ${directPushCount} 篇`);
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
