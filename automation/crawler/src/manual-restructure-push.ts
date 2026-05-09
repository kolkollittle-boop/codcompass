/**
 * 手动重构+推送 - 处理 auto-restructure-push.ts 未完成的部分
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

function isRestructured(contentEn: string | null): boolean {
  if (!contentEn) return false;
  const markers = [
    'Current Situation Analysis', 'WOW Moment', 'Core Solution',
    'Pitfall Guide', 'Production Bundle',
    '## Current Situation', '## WOW Moment', '## Core Solution', '## Pitfall',
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
  return plainText.substring(0, maxLength) + '...';
}

async function main() {
  const startTime = Date.now();
  console.log('🔧 手动重构+推送开始');
  console.log(`⏰ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails, originalUrl, sourceSite, sourceAuthor, crawledAt')
    .eq('status', 'REVIEW')
    .gte('qualityScore', 65)
    .order('qualityScore', { ascending: false });

  if (error) { console.error('❌ 查询失败:', error.message); process.exit(1); }
  if (!articles || articles.length === 0) { console.log('✅ 没有需要处理的文章'); return; }

  console.log(`📋 找到 ${articles.length} 篇待处理文章`);
  console.log('');

  let successCount = 0, restructuredCount = 0, directPushCount = 0, failedCount = 0;
  const failedTitles: string[] = [];

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] ${article.titleEn?.slice(0, 80) || '无标题'}`);
    console.log(`  分数: ${article.qualityScore} | ID: ${article.id.slice(0, 8)}`);

    try {
      if (isRestructured(article.contentEn)) {
        console.log('  ✅ 已重构，直接推送');
        const { error: updateError } = await supabase
          .from('Article')
          .update({ status: 'PUBLISHED', isPublished: true, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
          .eq('id', article.id);
        if (updateError) {
          console.error(`  ❌ 更新失败: ${updateError.message}`);
          failedCount++; failedTitles.push(article.titleEn || '无标题');
        } else {
          console.log('  🎉 已发布'); directPushCount++; successCount++;
        }
      } else {
        console.log('  🔄 未重构，调用 AI 重构 (60s 超时)...');
        const evaluation = article.qualityDetails || { difficulty_level: 'L2' };

        try {
          // 用 Promise.race 实现超时控制
          const restructured = await Promise.race([
            restructureArticle(article.titleEn || '', article.contentEn || '', evaluation),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('60s timeout')), 60000)),
          ]);

          const updateData: Record<string, unknown> = {
            status: 'PUBLISHED', isPublished: true, publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(), titleEn: restructured.title,
            contentEn: restructured.content, descriptionEn: generateExcerpt(restructured.content, 300),
            excerptEn: restructured.excerpt, difficultyLevel: restructured.difficultyLevel,
            readingTime: restructured.readingTimeMinutes, expectedOutcome: restructured.expectedOutcome,
          };
          if (restructured.tags?.length > 0) {
            (updateData as any).qualityDetails = { ...evaluation, tags: restructured.tags };
          }

          const { error: updateError } = await supabase.from('Article').update(updateData).eq('id', article.id);
          if (updateError) {
            console.error(`  ❌ 更新失败: ${updateError.message}`);
            failedCount++; failedTitles.push(article.titleEn || '无标题');
          } else {
            console.log(`  🎉 已重构并发布 (${restructured.content.length} 字)`);
            restructuredCount++; successCount++;
          }
        } catch (restructureError: unknown) {
          const msg = restructureError instanceof Error ? restructureError.message : String(restructureError);
          console.log(`  ⚠️ 重构失败: ${msg.slice(0, 120)}，原文直接发布`);
          const { error: fallbackError } = await supabase
            .from('Article')
            .update({ status: 'PUBLISHED', isPublished: true, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
            .eq('id', article.id);
          if (fallbackError) {
            console.error(`  ❌ fallback 也失败: ${fallbackError.message}`);
            failedCount++; failedTitles.push(article.titleEn || '无标题');
          } else {
            console.log('  📤 原文已发布'); successCount++; // 也算成功
          }
        }
      }
    } catch (err) {
      console.error(`  ❌ 异常: ${(err as Error).message.slice(0, 150)}`);
      failedCount++; failedTitles.push(article.titleEn || '无标题');
    }

    if (i < articles.length - 1) await new Promise(r => setTimeout(r, 2000));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 任务完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒`);
  console.log(`📋 待处理: ${articles.length} 篇`);
  console.log(`✅ 成功发布: ${successCount} 篇`);
  console.log(`  🔄 AI 重构: ${restructuredCount} 篇`);
  console.log(`  📤 直接推送: ${directPushCount} 篇`);
  console.log(`❌ 失败: ${failedCount} 篇`);
  if (failedTitles.length > 0) {
    console.log('失败文章:');
    failedTitles.slice(0, 10).forEach(t => console.log(`  - ${t.slice(0, 60)}`));
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(err => { console.error('💥 任务异常:', err); process.exit(1); });
