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
    '## Production Bundle',
  ];
  return markers.some(m => contentEn.includes(m));
}

async function main() {
  console.log('🔍 检查已发布文章中未重构的文章');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // 查询所有已发布文章
  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, qualityDetails, slug')
    .eq('status', 'PUBLISHED');

  if (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ 没有已发布文章');
    return;
  }

  console.log(`📋 已发布文章总数: ${articles.length} 篇\n`);

  // 检查每篇是否已重构
  const unstructured: typeof articles = [];
  const structured: typeof articles = [];

  for (const article of articles) {
    const qd = article.qualityDetails as any;
    const isDeepGenerated = article.sourceSite === 'ai-deep-generated';
    const hasRestructureFlag = qd && typeof qd === 'object' && qd.restructured === true;
    const hasStructure = isRestructured(article.contentEn);

    if (hasRestructureFlag || hasStructure || isDeepGenerated) {
      structured.push(article);
    } else {
      // 未重构：sourceSite 不是 ai-deep-generated，且没有结构标记，且没有重构标记
      unstructured.push(article);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('📊 检查结果');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ 已重构/深度生成: ${structured.length} 篇`);
  console.log(`⛔ 未重构: ${unstructured.length} 篇`);
  console.log('');

  if (unstructured.length > 0) {
    console.log('⛔ 未重构文章列表（前 50 篇）:');
    console.log('');
    for (const article of unstructured.slice(0, 50)) {
      const qd = article.qualityDetails as any;
      console.log(`  - ${article.titleEn?.slice(0, 80) || '无标题'}`);
      console.log(`    sourceSite: ${article.sourceSite || 'null'} | slug: ${article.slug?.slice(0, 60)}`);
    }
    if (unstructured.length > 50) {
      console.log(`  ... 还有 ${unstructured.length - 50} 篇`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
