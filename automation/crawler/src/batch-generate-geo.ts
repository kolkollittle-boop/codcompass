/**
 * 批量为已发布文章生成 GEO 元数据
 *
 * 功能：
 * - 扫描所有 PUBLISHED 且 seoTitle 为空的文章
 * - 使用本地算法生成 seoTitle, seoDescription, geoKeywords
 * - 更新数据库
 *
 * 执行方式：
 *   cd automation/crawler && npx tsx src/batch-generate-geo.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateSeoTitle, generateSeoDescription, generateGeoKeywords } from './article-restructurer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const startTime = Date.now();
  console.log('🚀 批量 GEO 元数据生成启动');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // Fetch all published articles missing SEO data
  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, seoTitle, seoDescription, metadata')
    .eq('isPublished', true)
    .or('seoTitle.is.null,seoTitle.eq.')
    .limit(1900);

  if (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ 所有已发布文章已有 SEO 数据');
    return;
  }

  console.log(`📋 找到 ${articles.length} 篇需要生成 GEO 元数据的文章`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const idx = i + 1;

    // Skip if already has seoTitle
    if (article.seoTitle && article.seoTitle.trim().length > 0) {
      continue;
    }

    try {
      const seoTitle = generateSeoTitle(article.titleEn || '');
      const seoDescription = generateSeoDescription(article.contentEn || '', article.titleEn || '');
      const geoKeywords = generateGeoKeywords(article.contentEn || '', article.titleEn || '');

      const updateData: Record<string, unknown> = {
        seoTitle,
        seoDescription,
      };

      // Merge geoKeywords into existing metadata
      const existingMeta = (article.metadata as Record<string, unknown> | null) || {};
      updateData.metadata = {
        ...existingMeta,
        geoKeywords,
      };

      const { error: updateError } = await supabase
        .from('Article')
        .update(updateData)
        .eq('id', article.id);

      if (updateError) {
        console.error(`  ❌ [${idx}/${articles.length}] 更新失败: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ [${idx}/${articles.length}] ${seoTitle.slice(0, 60)}... | ${geoKeywords.length} keywords`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ [${idx}/${articles.length}] 异常: ${(err as Error).message.slice(0, 150)}`);
      errorCount++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 GEO 批量生成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒`);
  console.log(`📋 扫描: ${articles.length} 篇`);
  console.log(`✅ 成功: ${successCount} 篇`);
  console.log(`❌ 失败: ${errorCount} 篇`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
