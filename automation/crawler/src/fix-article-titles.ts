#!/usr/bin/env node
/**
 * 修复批量生成文章的标题
 * 问题：AI 生成的文章第一个标题有时是配置文件名而非文章标题
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Patterns that indicate a bad title
const BAD_TITLE_PATTERNS = [
  /^topic for /i,
  /^backfill article/i,
  /\.(yaml|yml|json|toml|ini|cfg|conf)$/i,
  /^\.github\//i,
  /^network & access/i,
  /^memory configuration/i,
];

function isGoodTitle(title) {
  if (title.length < 25) return false;
  for (const p of BAD_TITLE_PATTERNS) {
    if (p.test(title)) return false;
  }
  return true;
}

function extractGoodTitle(content, fallback) {
  if (!content) return fallback;
  const lines = content.split('\n');
  const headings = [];
  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+)$/);
    if (m && m[1].trim()) {
      headings.push(m[1].trim());
    }
  }
  // Try first heading, skip if it looks like a config file
  for (const h of headings) {
    if (isGoodTitle(h)) return h.substring(0, 199);
  }
  // Try second heading if first is bad
  if (headings.length > 1) {
    const h = headings[1];
    if (h.length > 25 && h.length < 200) return h.substring(0, 199);
  }
  return fallback;
}

async function main() {
  const { data: articles } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn')
    .eq('sourceSite', 'ai-generated');

  const bad = (articles || []).filter(a => !isGoodTitle(a.titleEn));
  console.log('Found ' + bad.length + ' articles with bad titles out of ' + articles?.length + ' total\n');

  let fixed = 0, skipped = 0;
  for (let i = 0; i < bad.length; i++) {
    const a = bad[i];
    const newTitle = extractGoodTitle(a.contentEn, a.titleEn);
    
    if (newTitle === a.titleEn || !isGoodTitle(newTitle)) {
      // Try AI to generate a good title
      try {
        const resp = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY },
          body: JSON.stringify({
            model: 'qwen3-coder-plus',
            messages: [{ role: 'user', content: 'Extract a proper article title (10-80 chars) from this markdown. Return ONLY the title, nothing else:\n\n' + (a.contentEn || '').substring(0, 1000) }],
            max_tokens: 50, temperature: 0.1,
          }),
        });
        const data = await resp.json();
        const aiTitle = data.choices?.[0]?.message?.content?.replace(/^#\s*/, '').trim();
        if (aiTitle && aiTitle.length > 15 && aiTitle.length < 200) {
          const updatedTitle = aiTitle;
          const newSlug = updatedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60) + '-' + Date.now().toString(36).slice(-6);
          const { error } = await supabase.from('Article').update({ titleEn: updatedTitle, slug: newSlug }).eq('id', a.id);
          if (!error) {
            console.log('  [AI] ✅ "' + a.titleEn.slice(0, 30) + '" → "' + updatedTitle.slice(0, 50) + '"');
            fixed++;
          }
        }
      } catch { /* skip */ }
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60) + '-' + Date.now().toString(36).slice(-6);
    const { error } = await supabase.from('Article').update({ titleEn: newTitle, slug: newSlug }).eq('id', a.id);
    if (!error) {
      console.log('  ✅ "' + a.titleEn.slice(0, 30) + '" → "' + newTitle.slice(0, 50) + '"');
      fixed++;
    } else {
      console.log('  ❌ Failed: ' + error.message);
    }
    skipped++;
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n✅ Fixed ' + fixed + ' titles (' + skipped + ' skipped, ' + (bad.length - fixed) + ' unchanged)');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
