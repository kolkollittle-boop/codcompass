#!/usr/bin/env node
/**
 * 补录文章：让每个分类至少达到 TARGET 篇
 * Usage: npx tsx src/topup-articles.ts --target 10
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TARGET = Number(process.env.ARTICLE_TOPUP_TARGET || 10);
const INTERVAL_MS = 5000;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 120000;

const TOPIC_SEEDS: Record<string, string[]> = {
  'cc20-3-2-growth-traffic': [
    'SEO optimization for developer tools', 'Content marketing for SaaS',
    'Growth hacking with AI', 'Building organic traffic engine',
    'Email marketing automation', 'Referral program design',
    'Product Hunt launch strategy', 'Community-led growth',
    'Viral loop mechanics', 'Social media growth for devs'
  ],
  'cc20-3-3-one-person-os': [
    'Solo founder productivity system', 'Building a one-person company',
    'Automation for solo developers', 'Time management for indie hackers',
    'Building passive income streams', 'Solo SaaS operations guide',
    'One-person marketing system', 'Solo founder finance management',
    'Building with AI as solo dev', 'Solo developer customer support'
  ],
  'cc20-2-1-architecture-transformation': [
    'Monolith to microservices migration', 'Event-driven architecture patterns',
    'API gateway implementation', 'Service mesh adoption guide',
    'Cloud-native architecture design', 'Distributed system patterns',
    'Architecture decision records', 'System design interview patterns',
    'Scalable architecture principles', 'Architecture documentation'
  ],
  'cc20-2-3-data-architecture': [
    'Data pipeline architecture', 'Real-time data processing',
    'Data warehouse vs data lake', 'Data mesh implementation',
    'Stream processing with Kafka', 'Data governance framework',
    'Data quality monitoring', 'ETL pipeline optimization',
    'Data modeling best practices', 'Data catalog implementation'
  ],
  'cc20-4-3-reusable-components': [
    'React component library design', 'Design system architecture',
    'Building reusable UI components', 'Component testing strategies',
    'Component documentation', 'Cross-platform component sharing',
    'Component versioning', 'Component theming system',
    'Component accessibility patterns', 'Component performance'
  ],
  'mobile': [
    'SwiftUI layout patterns', 'React Native performance guide',
    'Flutter state management', 'Mobile app architecture',
    'iOS app lifecycle guide', 'Android Jetpack Compose',
    'Cross-platform development', 'Mobile CI/CD pipeline',
    'App Store optimization', 'Mobile analytics setup'
  ],
  'cc20-1-2-enterprise-rag': [
    'Enterprise RAG architecture', 'Knowledge base indexing',
    'RAG evaluation metrics', 'Multi-document RAG',
    'RAG with fine-tuning', 'RAG caching strategies',
    'RAG security patterns', 'Production RAG deployment',
    'RAG observability', 'Hybrid search RAG'
  ],
  'product': [
    'Product-market fit guide', 'SaaS pricing strategies',
    'User onboarding optimization', 'Growth metrics tracking',
    'Lean startup methodology', 'Product roadmap planning',
    'Customer development guide', 'A/B testing strategies',
    'MVP validation process', 'Product analytics setup'
  ],
  'cc20-1-4-ai-productization': [
    'AI product monetization', 'Building AI SaaS products',
    'AI feature pricing', 'AI product validation',
    'AI product distribution', 'AI API monetization',
    'AI product analytics', 'AI product security',
    'AI product compliance', 'AI product scaling'
  ],
  'cc20-1-3-local-llm': [
    'Local LLM deployment guide', 'Ollama setup tutorial',
    'LM Studio configuration', 'Local embedding models',
    'On-device inference optimization', 'LLM quantization guide',
    'Edge AI deployment', 'Local AI privacy',
    'Local LLM performance tuning', 'Local model selection'
  ],
  'devops': [
    'CI/CD pipeline design', 'Docker containerization',
    'Kubernetes deployment patterns', 'Terraform infrastructure',
    'GitOps workflow guide', 'Monitoring stack setup',
    'Log aggregation patterns', 'Cloud cost optimization',
    'Zero-downtime deployment', 'Container security scanning'
  ],
  'cc20-2-2-dotnet-csharp': [
    '.NET 9 performance guide', 'C# async patterns',
    'ASP.NET Core middleware', 'Entity Framework optimization',
    'Minimal APIs guide', '.NET testing strategies',
    'C# pattern matching', 'Blazor development',
    '.NET dependency injection', '.NET microservices'
  ],
};

async function generateArticle(topic: string): Promise<string | null> {
  const systemPrompt = `You are a senior technical editor writing for Codcompass, a premium developer knowledge base.

Write a comprehensive, original technical article about: "${topic}"

## Current Situation Analysis
- The industry pain point this topic addresses
- Why this problem is overlooked
- Data-backed evidence

## WOW Moment: Key Findings
- A data comparison table

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|
| [A] | [data] | [data] | [data] |

## Core Solution
- Step-by-step implementation
- Code examples
- Architecture decisions

## Pitfall Guide
- 5-7 common mistakes

## Production Bundle

### Action Checklist
- 5-8 actionable items

### Decision Matrix
- Comparison table

### Configuration Template
- Ready-to-copy code

### Quick Start Guide
- 3-5 steps

Markdown format. English. 2000-4000 words. No fluff. 100% original.`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen3.5-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Write a comprehensive technical article about: "${topic}"` },
          ],
          max_tokens: 8000,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const status = response.status;
        if (status === 429 || status >= 500) {
          if (attempt < MAX_RETRIES) continue;
          return null;
        }
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content || content.trim().length < 500) {
        if (attempt < MAX_RETRIES) continue;
        return null;
      }

      return content;
    } catch {
      if (attempt >= MAX_RETRIES) return null;
    }
  }
  return null;
}

async function insertArticle(title: string, content: string, categorySlug: string): Promise<boolean> {
  const articleId = crypto.randomUUID();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60)}-${Date.now().toString(36).slice(-6)}`;
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('Article').insert({
    id: articleId,
    slug,
    titleEn: title,
    contentEn: content,
    excerptEn: content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200),
    sourceSite: 'ai-generated',
    crawledAt: now,
    status: 'PUBLISHED',
    qualityScore: 80,
    qualityDetails: { score: 80, is_ai_generated: true, generated_at: now, difficulty_level: 'L2' },
    isPublished: true,
    publishedAt: now,
    isPremium: false,
    createdAt: now,
    updatedAt: now,
  });

  if (insertError) {
    console.error(`    ❌ Insert: ${insertError.message}`);
    return false;
  }

  const { data: category } = await supabase.from('Category').select('id').eq('slug', categorySlug).single();
  if (category) {
    await supabase.from('_ArticleToCategory').insert({ A: articleId, B: category.id });
  }

  return true;
}

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return (match && match[1]?.trim().length > 5) ? match[1].trim().substring(0, 199) : fallback;
}

async function main() {
  const { data: links } = await supabase.from('_ArticleToCategory').select('A, B');
  const { data: categories } = await supabase.from('Category').select('id, slug');

  const counts: Record<string, number> = {};
  for (const cat of categories || []) {
    counts[cat.slug] = (links || []).filter(l => l.B === cat.id).length;
  }

  const tasks: { slug: string; need: number; topics: string[] }[] = [];

  for (const [slug, count] of Object.entries(counts)) {
    if (count >= TARGET) continue;
    const need = TARGET - count;
    const topics = TOPIC_SEEDS[slug];
    if (!topics) {
      console.log(`⚠️ No topics defined for ${slug}, skipping`);
      continue;
    }
    tasks.push({ slug, need: Math.min(need, topics.length), topics: topics.slice(0, Math.min(need, topics.length)) });
  }

  if (tasks.length === 0) {
    console.log('✅ All categories meet target!');
    return;
  }

  const total = tasks.reduce((s, t) => s + t.need, 0);
  console.log(`📋 Top-up plan: ${total} articles across ${tasks.length} categories`);
  console.log(`   Est. time: ~${Math.ceil(total * 1.5 / 60)} hours\n`);

  for (const task of tasks) {
    console.log(`\n📂 ${task.slug} — need ${task.need} articles (current: ${counts[task.slug]})`);

    for (let i = 0; i < task.topics.length; i++) {
      const topic = task.topics[i];
      console.log(`  [${i + 1}/${task.topics.length}] ${topic}`);

      const content = await generateArticle(topic);
      if (!content) {
        console.log(`    ❌ Failed`);
        continue;
      }

      const title = extractTitle(content, topic);
      const ok = await insertArticle(title, content, task.slug);
      console.log(`    ${ok ? '✅' : '❌'} "${title.slice(0, 50)}..."`);

      if (i < task.topics.length - 1) {
        await new Promise(r => setTimeout(r, INTERVAL_MS));
      }
    }
  }

  console.log('\n✅ Top-up complete!');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
