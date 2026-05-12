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

// 检测是否已重构
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
  console.log('🔧 回退未重构文章 + 检查今日爬虫');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // ── 步骤 1: 回退 8 篇未重构文章 ─────────────────────
  console.log('📋 步骤 1: 回退未重构文章到 REVIEW');

  const { data: published } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, qualityDetails, status')
    .eq('status', 'PUBLISHED');

  if (!published) { console.log('❌ 查询失败'); return; }

  const unstructured = published.filter(a => {
    const qd = a.qualityDetails as any;
    const isDeepGenerated = a.sourceSite === 'ai-deep-generated';
    const hasRestructureFlag = qd && typeof qd === 'object' && qd.restructured === true;
    const hasStructure = isRestructured(a.contentEn);
    return !(hasRestructureFlag || hasStructure || isDeepGenerated);
  });

  let reverted = 0;
  for (const a of unstructured) {
    // 打上永久标记防止再次发布
    const qd = a.qualityDetails as any || {};
    const { error } = await supabase
      .from('Article')
      .update({
        status: 'REVIEW',
        updatedAt: new Date().toISOString(),
        qualityDetails: {
          ...qd,
          restructured: false,
          blocked_until_restructured: true,
          reverted_at: new Date().toISOString(),
          reverted_by: 'manual-revert',
        },
      })
      .eq('id', a.id);

    if (error) {
      console.log(`  ❌ 回退失败: ${a.titleEn?.slice(0, 60)} - ${error.message}`);
    } else {
      reverted++;
      console.log(`  ✅ 已回退: ${a.titleEn?.slice(0, 60)}`);
    }
  }
  console.log(`   回退了 ${reverted} 篇\n`);

  // ── 步骤 2: 检查今日爬虫文章 ─────────────────────
  console.log('📋 步骤 2: 检查今日爬虫文章是否已重构');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayArticles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, status, crawledAt, createdAt, qualityDetails')
    .gte('createdAt', todayStart.toISOString());

  if (!todayArticles || todayArticles.length === 0) {
    console.log('✅ 今日没有新文章');
    return;
  }

  console.log(`   今日新文章: ${todayArticles.length} 篇\n`);

  let restructured = 0;
  let unstructuredToday: string[] = [];

  for (const a of todayArticles) {
    const qd = a.qualityDetails as any;
    const isDeepGenerated = a.sourceSite === 'ai-deep-generated';
    const hasRestructureFlag = qd && typeof qd === 'object' && qd.restructured === true;
    const hasStructure = isRestructured(a.contentEn);
    const isRestructuredArticle = hasRestructureFlag || hasStructure || isDeepGenerated;

    if (isRestructuredArticle) {
      restructured++;
    } else {
      unstructuredToday.push(`  ⛔ [${a.status}] ${a.titleEn?.slice(0, 70)}`);
    }
  }

  console.log(`   ✅ 已重构/深度生成: ${restructured} 篇`);
  console.log(`   ⛔ 未重构: ${unstructuredToday.length} 篇`);

  if (unstructuredToday.length > 0) {
    console.log('');
    console.log('未重构文章:');
    unstructuredToday.forEach(u => console.log(u));
  }
}

main().catch(console.error);
