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
async function main() {
  const today = new Date(); today.setHours(0,0,0,0);
  const { data } = await supabase
    .from('Article')
    .select('id, titleEn, sourceSite, qualityScore, status, createdAt')
    .gte('createdAt', today.toISOString())
    .eq('status', 'PUBLISHED');
  console.log('Today published:', data?.length || 0);
  const deepGen = data?.filter(a => a.sourceSite === 'ai-deep-generated') || [];
  console.log('Deep generated today:', deepGen.length);
  const scores = deepGen.map(a => a.qualityScore).filter(Boolean);
  if (scores.length > 0) {
    console.log('Avg score:', (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1));
    console.log('Min:', Math.min(...scores), 'Max:', Math.max(...scores));
  }
  const { count: total } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED');
  console.log('Total published:', total);
}
main().catch(console.error);
