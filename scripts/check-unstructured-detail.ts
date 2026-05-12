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
  const { data: articles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, sourceSite, qualityDetails, slug, createdAt')
    .eq('status', 'PUBLISHED');

  if (!articles || articles.length === 0) return;

  const unstructured = articles.filter(a => {
    const qd = a.qualityDetails as any;
    const isDeepGenerated = a.sourceSite === 'ai-deep-generated';
    const hasRestructureFlag = qd && typeof qd === 'object' && qd.restructured === true;
    const hasStructure = isRestructured(a.contentEn);
    return !(hasRestructureFlag || hasStructure || isDeepGenerated);
  });

  console.log('=== 未重构文章详情 ===\n');
  for (const a of unstructured) {
    const qd = a.qualityDetails as any;
    console.log(`标题: ${a.titleEn}`);
    console.log(`sourceSite: ${a.sourceSite}`);
    console.log(`createdAt: ${a.createdAt}`);
    console.log(`qualityDetails: ${JSON.stringify(qd)}`);
    console.log(`内容长度: ${a.contentEn?.length || 0} 字`);
    console.log(`内容开头 (前 200 字):`);
    console.log(a.contentEn?.substring(0, 200));
    console.log('---');
    console.log('');
  }
}

main().catch(console.error);
