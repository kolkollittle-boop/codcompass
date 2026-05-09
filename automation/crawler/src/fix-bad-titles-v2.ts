#!/usr/bin/env node
/**
 * 修复被错误修复的标题（"Current Situation Analysis" 是正文段落标题，不是文章标题）
 * 用 AI 重新生成正确的文章标题
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: articles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn')
    .eq('sourceSite', 'ai-generated');

  const bad = (articles || []).filter(a => 
    a.titleEn === 'Current Situation Analysis' ||
    a.titleEn.length < 25
  );

  console.log('Found ' + bad.length + ' articles needing title fix\n');

  let fixed = 0;
  for (let i = 0; i < bad.length; i++) {
    const a = bad[i];
    console.log('[' + (i+1) + '/' + bad.length + '] Fixing: id=' + a.id.slice(0,8));

    // Use AI to extract a proper title
    try {
      const contentPreview = (a.contentEn || '').substring(0, 2000);
      const resp = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY },
        body: JSON.stringify({
          model: 'qwen3-coder-plus',
          messages: [{ role: 'user', content: 'Extract a proper technical article title (15-80 chars) from this markdown content. Return ONLY the title, nothing else. No quotes, no markdown.\n\n' + contentPreview }],
          max_tokens: 50, temperature: 0.1,
        }),
      });
      const data = await resp.json();
      let aiTitle = data.choices?.[0]?.message?.content?.replace(/^["'#*\s]+/, '').replace(/["'\s]+$/, '').trim();
      
      // Clean up
      aiTitle = aiTitle.replace(/^#\s*/, '').replace(/^##\s*/, '');
      
      if (aiTitle && aiTitle.length >= 15 && aiTitle.length <= 200 && 
          !aiTitle.includes('Current Situation') && !aiTitle.includes('WOW Moment')) {
        const newSlug = aiTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60) + '-' + Date.now().toString(36).slice(-6);
        const { error } = await supabase.from('Article').update({ titleEn: aiTitle, slug: newSlug }).eq('id', a.id);
        if (!error) {
          console.log('  ✅ "' + aiTitle.slice(0, 60) + '"');
          fixed++;
        } else {
          console.log('  ❌ DB error: ' + error.message);
        }
      } else {
        console.log('  ⚠️ AI returned bad title: "' + (aiTitle || '').slice(0, 50) + '"');
      }
    } catch (e: any) {
      console.log('  ❌ Error: ' + (e.message || '').slice(0, 100));
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✅ Fixed ' + fixed + '/' + bad.length + ' titles');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
