#!/usr/bin/env node
/**
 * 补录 4 个新建分类的文章（每类 10 篇）
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = {
  'cc20-2-scalable-backend-systems': [
    'Scalable microservices architecture patterns', 'Database sharding at scale',
    'CQRS and Event Sourcing implementation', 'Horizontal vs vertical scaling strategies',
    'Load balancing for high-traffic backends', 'Message queue scaling with Kafka',
    'Caching strategies for high-traffic APIs', 'Stateless service design patterns',
    'Database connection pooling at scale', 'Auto-scaling infrastructure patterns',
  ],
  'cc20-cross-security-compliance': [
    'SOC 2 compliance guide for startups', 'GDPR implementation for developers',
    'Security audit automation strategies', 'Penetration testing methodology',
    'Data encryption at rest and in transit', 'Zero-trust architecture patterns',
    'Vulnerability management programs', 'Security incident response planning',
    'API security best practices guide', 'Secrets management at scale',
  ],
  'cc20-cross-cost-sustainability': [
    'Cloud cost optimization strategies', 'FinOps framework implementation',
    'Serverless cost analysis and optimization', 'Database cost reduction techniques',
    'CDN cost optimization strategies', 'Infrastructure rightsizing guide',
    'Reserved vs on-demand instances', 'Cost allocation and tagging strategies',
    'AI and ML cost management', 'Multi-cloud cost comparison',
  ],
  'cc20-cross-observability': [
    'OpenTelemetry implementation guide', 'Distributed tracing patterns',
    'SLO and SLI design principles', 'Alert fatigue prevention strategies',
    'Log aggregation architecture', 'Metrics dashboard design',
    'Error budget management guide', 'Observability for microservices',
    'Real user monitoring setup', 'Incident debugging with traces',
  ],
};

async function generateArticle(topic) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 120000);
      const resp = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY },
        body: JSON.stringify({
          model: 'qwen3.5-plus',
          messages: [
            { role: 'system', content: 'Write a comprehensive technical article about: "' + topic + '". Codcompass 2.0 structure: Current Situation Analysis, WOW Moment table, Core Solution with code, Pitfall Guide (5-7), Production Bundle (Checklist, Decision Matrix, Config Template, Quick Start). Markdown, English, 2000-4000 words, 100% original.' },
            { role: 'user', content: 'Write about: ' + topic }
          ], max_tokens: 8000, temperature: 0.7,
        }),
      });
      clearTimeout(timer);
      if (!resp.ok) { if (attempt < 3) continue; return null; }
      const data = await resp.json();
      const c = data.choices?.[0]?.message?.content;
      if (!c || c.trim().length < 500) { if (attempt < 3) continue; return null; }
      return c;
    } catch { if (attempt >= 3) return null; }
  }
  return null;
}

async function insertArticle(title, content, catSlug) {
  const aid = crypto.randomUUID();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60) + '-' + Date.now().toString(36).slice(-6);
  const now = new Date().toISOString();
  const { error: ie } = await supabase.from('Article').insert({
    id: aid, slug, titleEn: title, contentEn: content,
    excerptEn: content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200),
    sourceSite: 'ai-generated', crawledAt: now, status: 'PUBLISHED', qualityScore: 80,
    qualityDetails: { score: 80, is_ai_generated: true, generated_at: now, difficulty_level: 'L2' },
    isPublished: true, publishedAt: now, isPremium: false, createdAt: now, updatedAt: now,
  });
  if (ie) { console.error('    Insert error:', ie.message); return false; }
  const { data: cat } = await supabase.from('Category').select('id').eq('slug', catSlug).single();
  if (cat) await supabase.from('_ArticleToCategory').insert({ A: aid, B: cat.id });
  return true;
}

async function main() {
  let total = 0, success = 0, fail = 0;
  const cats = Object.entries(categories);
  
  for (let ci = 0; ci < cats.length; ci++) {
    const [catSlug, topics] = cats[ci];
    console.log('\n📂 ' + catSlug + ' — ' + topics.length + ' articles');
    
    for (let ti = 0; ti < topics.length; ti++) {
      const topic = topics[ti];
      total++;
      console.log('  [' + total + '/' + 40 + '] ' + topic);
      
      const content = await generateArticle(topic);
      if (!content) { console.log('    ❌ Failed'); fail++; continue; }
      
      const m = content.match(/^#\s+(.+)$/m);
      const title = m ? m[1].trim().substring(0, 199) : topic;
      const ok = await insertArticle(title, content, catSlug);
      console.log('    ' + (ok ? '✅' : '❌') + ' "' + title.slice(0, 50) + '"');
      if (ok) success++; else fail++;
      
      if (ti < topics.length - 1) await new Promise(r => setTimeout(r, 5000));
    }
    
    if (ci < cats.length - 1) {
      console.log('   ⏳ Pausing 10s before next category...');
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  
  console.log('\n✅ Done! ' + success + '/' + total + ' articles created (' + fail + ' failed)');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
