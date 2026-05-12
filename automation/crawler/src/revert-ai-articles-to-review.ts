/**
 * 回退所有 AI 生成文章到 REVIEW 状态
 * 
 * 使用方式：
 *   cd automation/crawler && npx tsx src/revert-ai-articles-to-review.ts
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

async function main() {
  console.log('🔄 回退 AI 生成文章到 REVIEW 状态');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // 查询所有 ai-generated 文章
  const { data: aiArticles, error: queryError } = await supabase
    .from('Article')
    .select('id, titleEn, status')
    .eq('sourceSite', 'ai-generated');

  if (queryError) {
    console.error('❌ 查询失败:', queryError.message);
    process.exit(1);
  }

  if (!aiArticles || aiArticles.length === 0) {
    console.log('✅ 没有找到 AI 生成的文章');
    return;
  }

  console.log(`📋 找到 ${aiArticles.length} 篇 AI 生成文章`);
  console.log(`   PUBLISHED: ${aiArticles.filter(a => a.status === 'PUBLISHED').length} 篇`);
  console.log(`   REVIEW: ${aiArticles.filter(a => a.status === 'REVIEW').length} 篇`);
  console.log(`   其他: ${aiArticles.filter(a => a.status !== 'PUBLISHED' && a.status !== 'REVIEW').length} 篇`);
  console.log('');

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  // 批量回退，每批 50 条
  const BATCH_SIZE = 50;
  for (let i = 0; i < aiArticles.length; i += BATCH_SIZE) {
    const batch = aiArticles.slice(i, i + BATCH_SIZE);

    const { error: updateError } = await supabase
      .from('Article')
      .update({
        status: 'REVIEW',
        isPublished: false,
        updatedAt: new Date().toISOString(),
        qualityDetails: {
          needs_regeneration: true,
          reverted_at: new Date().toISOString(),
          reason: 'AI 生成质量不达标，需要用深度 prompt 重新生成',
        },
      })
      .in('id', batch.map(a => a.id));

    if (updateError) {
      console.error(`❌ 批量回退失败 [${i}-${i + batch.length}]: ${updateError.message}`);
      failCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✅ 回退 [${i + 1}-${i + batch.length}/${aiArticles.length}]`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 回退完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`📋 AI 生成文章总数: ${aiArticles.length} 篇`);
  console.log(`✅ 成功回退 REVIEW: ${successCount} 篇`);
  console.log(`⏭️ 已在 REVIEW 跳过: ${skipCount} 篇`);
  console.log(`❌ 回退失败: ${failCount} 篇`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
