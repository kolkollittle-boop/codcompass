/**
 * 快速发布剩余文章 - 不再调用 AI 重构，直接发布原文
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

function isRestructured(contentEn: string | null): boolean {
  if (!contentEn) return false;
  const markers = [
    'Current Situation Analysis', 'WOW Moment', 'Core Solution',
    'Pitfall Guide', 'Production Bundle',
    '## Current Situation', '## WOW Moment', '## Core Solution', '## Pitfall',
  ];
  return markers.some(m => contentEn.includes(m));
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 快速发布剩余文章 (不重构)');
  console.log(`⏰ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);

  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore')
    .eq('status', 'REVIEW')
    .gte('qualityScore', 65)
    .order('qualityScore', { ascending: false });

  if (error) { console.error('❌ 查询失败:', error.message); process.exit(1); }
  if (!articles || articles.length === 0) { console.log('✅ 没有剩余文章'); return; }

  console.log(`📋 找到 ${articles.length} 篇\n`);

  let direct = 0, original = 0, failed = 0;
  const failedTitles: string[] = [];

  for (const article of articles) {
    const restructured = isRestructured(article.contentEn);
    const { error: updateError } = await supabase
      .from('Article')
      .update({ status: 'PUBLISHED', isPublished: true, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .eq('id', article.id);

    if (updateError) {
      console.log(`❌ ${article.titleEn?.slice(0, 60)} - ${updateError.message}`);
      failed++; failedTitles.push(article.titleEn || '无标题');
    } else {
      if (restructured) { console.log(`✅ [已重构] ${article.titleEn?.slice(0, 60)}`); direct++; }
      else { console.log(`📤 [原文] ${article.titleEn?.slice(0, 60)}`); original++; }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 任务完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒`);
  console.log(`✅ 成功: ${direct + original} 篇`);
  console.log(`  🔄 已重构直接推送: ${direct} 篇`);
  console.log(`  📤 原文发布: ${original} 篇`);
  console.log(`❌ 失败: ${failed} 篇`);
  if (failedTitles.length > 0) {
    failedTitles.forEach(t => console.log(`  - ${t.slice(0, 60)}`));
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(err => { console.error('💥 异常:', err); process.exit(1); });
