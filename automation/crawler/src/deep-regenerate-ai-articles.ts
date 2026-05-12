/**
 * 深度重新生成 AI 原创文章
 * 
 * ⚠️ 铁律：未重构绝不发布
 * 本脚本生成的文章一律设为 REVIEW 状态，必须经过 auto-restructure-push.ts
 * 重构后才能发布。禁止直接设为 PUBLISHED。
 * 
 * 使用深度 prompt，每篇文章包含：
 * - 详细提纲（5 段式 Codcompass 2.0 结构）
 * - 可运行的代码示例
 * - 排错指南
 * - 真实案例
 * - 性能优化建议
 * 
 * 使用方式：
 *   cd automation/crawler && npx tsx src/deep-regenerate-ai-articles.ts
 *   cd automation/crawler && npx tsx src/deep-regenerate-ai-articles.ts --category security --batch 5
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const aiClient = new OpenAI({
  baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ── 文章生成 Prompt（深度版 v2 - 针对性提分） ──────────────────────────────

function buildDeepPrompt(topic: string): string {
  return `You are a principal engineer at a FAANG company writing a battle-tested technical article for Codcompass, a premium developer knowledge base. Your audience is mid-to-senior level developers who want production-ready solutions they can use TODAY.

**Topic:** ${topic}

**CRITICAL — You will be scored on these 4 dimensions (total 100 points):**
1. Practicality (40 pts): Must have runnable code, debugging guides, concrete steps
2. Timeliness (30 pts): Must use current tech stack versions (2024-2026), no outdated APIs
3. Uniqueness (20 pts): Must have original insights, NOT documentation copy-paste
4. Business Value (10 pts): Must show ROI, cost savings, or productivity gains

**To score 70+: you MUST include:**
- At least 3 complete, runnable code blocks (TypeScript/Python/Go — with error handling)
- Specific performance metrics ("reduced latency from 340ms to 12ms")
- Real debugging stories with actual error messages and how to fix them
- Cost analysis or ROI calculations
- A unique pattern or approach that isn't in official docs
- Version numbers for every tool mentioned (e.g., "Node.js 22", "React 19", "PostgreSQL 17")

**REQUIRED STRUCTURE (Codcompass 2.0 format):**

\`\`\`
# [Specific, metric-driven title with numbers]

## Current Situation Analysis
- Real-world problem with specific pain points
- Why most tutorials get this wrong
- Concrete example of a bad approach and why it fails
- Set up the "WOW moment"

## WOW Moment
- The paradigm shift
- Why this approach is fundamentally different
- The "aha" moment in one sentence

## Core Solution
- Step-by-step with production-grade code
- EVERY code block must have: types, error handling, comments
- Explain the WHY, not just the WHAT
- Include configuration files when relevant

## Pitfall Guide
- 4-5 real production failures I've debugged
- Exact error messages and root causes
- "If you see X, check Y" troubleshooting table
- Edge cases most people miss

## Production Bundle
- Performance numbers (benchmarks if possible)
- Monitoring setup (specific tools and dashboards)
- Scaling considerations with real numbers
- Cost breakdown ($/month estimates)
- Actionable checklist
\`\`\`

**STRICT PROHIBITIONS (each deducts 50 points if found):**
- NO marketing language, NO "in today's fast-paced digital world"
- NO "Let's dive in" or "Without further ado"
- NO promotional content, affiliate links, or CTAs
- NO vague advice like "consider using" — be prescriptive
- NO generic titles — must include metrics or specific outcomes

**Title Examples (good):**
- "How I Cut API Latency by 73% with Connection Pooling"
- "The Docker Compose Pattern That Saved Us 4 Hours/Week"
- "Debugging Memory Leaks: From 4GB to 200MB in 3 Steps"

**Title Examples (bad):**
- "A Guide to API Design"
- "Introduction to Docker"
- "Understanding Memory Management"

**Tone:** Direct, experienced, slightly opinionated. Write like you're mentoring a senior engineer. Use first-person experience ("When we migrated...").

**Length:** 2500-5000 words. Every section must be substantial.

Output ONLY the article content in markdown format. No preamble, no explanation, no "here is the article".`;
}

// ── AI 评分 ──────────────────────────────────────────────

async function scoreArticle(title: string, content: string): Promise<{ score: number; dimensions?: any }> {
  const systemPrompt = `Please return the result in a strict JSON format.

You are a senior technical editor (direct, outcome-focused). Score and evaluate the following technical article.
The field mentor_summary MUST be English only (two short sentences), regardless of the article language.

**评分矩阵 (总分 100):**
1. 实操性 (40 分): 是否有可运行的代码、排错指南、具体步骤？
2. 时效性 (30 分): 技术栈是否过时？是否为当前主流版本？
3. 独特性 (20 分): 是否有独家见解或深度解析？
4. 商业价值 (10 分): 对付费用户是否有高价值？

**强制扣分项:**
- 发现营销引流/焦虑标题/广告 -> 扣 50 分。
- 纯理论无代码/水文 -> 扣 20 分。

**输出要求:**
仅输出严格的 JSON，不要包含 Markdown 格式代码块，不要任何前缀。
JSON 结构:
{
  "score": 85,
  "dimensions": { "practicality": 40, "timeliness": 25, "uniqueness": 15, "business": 5 },
  "difficulty_level": "L2",
  "is_promotional": false,
  "mentor_summary": "Two short sentences in English.",
  "webhook_action": "push_discord"
}`;

  try {
    const completion = await aiClient.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Title: ${title}\nContent: ${content.substring(0, 5000)}...` }
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(raw);
    return { score: parsed.score || 0, dimensions: parsed };
  } catch (e: any) {
    // 429 限流 → 等待重试
    if (e.status === 429) {
      await new Promise(r => setTimeout(r, 30000));
      return scoreArticle(title, content);
    }
    return { score: 0 };
  }
}

// ── 生成 excerpt ──────────────────────────────────────────────

function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
  if (plainText.length <= maxLength) return plainText;
  const truncated = plainText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'));
  if (lastSentenceEnd > maxLength * 0.5) return truncated.substring(0, lastSentenceEnd + 1);
  return truncated + '...';
}

// ── 生成文章（带 429 重试） ──────────────────────────────────────────────

async function generateArticle(topic: string, retry = 0): Promise<{ title: string; content: string } | null> {
  try {
    const completion = await aiClient.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [
        { role: 'system', content: 'You are a principal engineer who writes exceptional technical articles.' },
        { role: 'user', content: buildDeepPrompt(topic) }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = completion.choices[0].message.content;
    if (!content || content.length < 1500) {
      console.log(`    ⚠️ 生成内容太短 (${content?.length || 0} 字)`);
      return null;
    }

    // 提取标题（并从内容中移除标题前缀，防止正文包含标题）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim().substring(0, 199) : topic;
    let cleanContent = titleMatch ? content.replace(/^#\s+.+\n?/, '').trim() : content;
    // 移除可能存在的多个连续的 # 标题行
    cleanContent = cleanContent.replace(/^(#\s+.+\n?)+/, '').trim();
    // 确保内容以 ## 或正常段落开头
    if (!cleanContent.startsWith('##') && !cleanContent.startsWith('#') && cleanContent.length > 0) {
      // 内容已经是正常段落，保持不变
    }

    return { title, content: cleanContent };
  } catch (e: any) {
    // 429 限流 → 重试
    if (e.status === 429 && retry < 3) {
      const waitMs = (retry + 1) * 15000;
      console.log(`    ⏳ 429 限流，等待 ${waitMs / 1000} 秒后重试 (${retry + 1}/3)`);
      await new Promise(r => setTimeout(r, waitMs));
      return generateArticle(topic, retry + 1);
    }
    console.error(`    ❌ 生成失败: ${e.message}`);
    return null;
  }
}

// ── 插入文章到数据库 ──────────────────────────────────────────────

async function insertArticle(
  title: string,
  content: string,
  score: number,
  dimensions: any,
  categorySlug: string,
  sourceSite: string = 'ai-deep-generated'
): Promise<boolean> {
  const articleId = crypto.randomUUID();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60)}-${Date.now().toString(36).slice(-6)}`;
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('Article').insert({
    id: articleId,
    slug,
    titleEn: title,
    contentEn: content,
    excerptEn: generateExcerpt(content, 300),
    descriptionEn: generateExcerpt(content, 300),
    sourceSite,
    crawledAt: now,
    status: 'REVIEW',  // ⚠️ 铁律：禁止直接发布，必须经过重构
    qualityScore: score,
    qualityDetails: {
      ...dimensions,
      is_ai_generated: true,
      deep_generated: true,
      generated_at: now,
      pending_restructure: true,
    },
    isPublished: false,  // ⚠️ 铁律：未重构绝不发布
    publishedAt: null,
    isPremium: false,
    createdAt: now,
    updatedAt: now,
  });

  if (insertError) {
    console.error(`    ❌ 插入失败: ${insertError.message}`);
    return false;
  }

  // 关联分类
  const { data: category } = await supabase.from('Category').select('id').eq('slug', categorySlug).single();
  if (category) {
    await supabase.from('_ArticleToCategory').insert({ A: articleId, B: category.id });
  }

  return true;
}

// ── 分类 Topic 种子 ──────────────────────────────────────────────

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
  'security': [
    'Zero Trust architecture implementation', 'API security best practices',
    'Secret management in production', 'Container security scanning',
    'OWASP Top 10 for modern apps', 'Supply chain security',
    'Penetration testing automation', 'Security audit checklist',
    'Incident response playbook', 'Compliance automation (SOC2)'
  ],
  'cc20-4-1-tools-efficiency': [
    'CLI tool automation', 'Developer productivity metrics',
    'CI/CD pipeline optimization', 'Code review automation',
    'Documentation as code', 'Git workflow optimization',
    'Terminal customization', 'Development environment setup',
    'Build system optimization', 'Testing strategy automation'
  ],
  'cc20-1-1-rag-fundamentals': [
    'Building RAG from scratch', 'Vector database comparison',
    'Embedding model selection', 'RAG prompt engineering',
    'Chunking strategies', 'Retrieval optimization',
    'RAG evaluation frameworks', 'Production RAG deployment',
    'RAG cost optimization', 'RAG observability'
  ],
  'ai-agent-development': [
    'Building autonomous AI agents', 'Agent orchestration patterns',
    'Tool use in AI agents', 'Multi-agent collaboration',
    'Agent memory systems', 'Agent evaluation',
    'ReAct pattern implementation', 'Agent safety guardrails',
    'Production agent deployment', 'Agent cost optimization'
  ],
  'frontend': [
    'React Server Components deep dive', 'Next.js 15 app router',
    'CSS architecture at scale', 'Frontend performance',
    'State management patterns', 'Micro-frontend architecture',
    'Accessibility audit guide', 'Frontend testing strategy',
    'Bundle optimization', 'Web Vitals optimization'
  ],
  'backend': [
    'Node.js production patterns', 'Go for backend services',
    'Database connection pooling', 'API rate limiting',
    'Background job processing', 'Event sourcing patterns',
    'CQRS implementation', 'GraphQL federation',
    'Message queue patterns', 'Distributed tracing'
  ],
  'api': [
    'REST API design patterns', 'GraphQL schema design',
    'API versioning strategies', 'API documentation',
    'API gateway patterns', 'gRPC vs REST',
    'API authentication patterns', 'API rate limiting',
    'API monitoring', 'API testing strategies'
  ],
  'cloud-infra': [
    'AWS cost optimization', 'Terraform best practices',
    'Kubernetes production guide', 'Serverless architecture',
    'Multi-cloud strategy', 'Infrastructure monitoring',
    'Disaster recovery planning', 'Cloud security',
    'Container orchestration', 'GitOps workflow'
  ],
  'devops': [
    'GitHub Actions advanced', 'Docker multi-stage builds',
    'Kubernetes deployment strategies', 'Monitoring stack setup',
    'Log aggregation', 'CI/CD security',
    'Infrastructure as code', 'Blue-green deployments',
    'Canary releases', 'Chaos engineering'
  ],
  'database': [
    'PostgreSQL optimization', 'Redis caching patterns',
    'Database migration strategies', 'NoSQL schema design',
    'Database sharding', 'Connection pooling',
    'Query optimization', 'Database backup strategies',
    'Read replica setup', 'Database monitoring'
  ],
  'testing': [
    'Integration testing patterns', 'E2E testing with Playwright',
    'Mocking strategies', 'Test data management',
    'Performance testing', 'Contract testing',
    'Mutation testing', 'Testing React components',
    'API testing automation', 'Load testing guide'
  ],
  'auth': [
    'OAuth 2.0 implementation', 'JWT best practices',
    'Session management', 'SSO implementation',
    'Password security', 'MFA implementation',
    'RBAC vs ABAC', 'API authentication patterns',
    'Token refresh strategies', 'Auth0 migration'
  ],
  'cc20-1-3-multimodal-rag': [
    'Multimodal RAG architecture', 'Image search with RAG',
    'Audio processing in RAG', 'Video content indexing',
    'Cross-modal retrieval', 'Multimodal embeddings',
    'Production multimodal RAG', 'Multimodal evaluation',
    'PDF + image RAG', 'Video transcript RAG'
  ],
  'cc20-2-2-microservices-patterns': [
    'Service discovery patterns', 'Circuit breaker implementation',
    'Saga pattern', 'Distributed transactions',
    'Service mesh patterns', 'API composition',
    'Database per service', 'Event-driven microservices',
    'Microservices testing', 'Microservices monitoring'
  ],
  'cc20-4-2-performance-optimization': [
    'React performance optimization', 'Database query optimization',
    'CDN optimization', 'Image optimization',
    'Cache invalidation', 'Memory leak debugging',
    'Network optimization', 'Bundle splitting',
    'Lazy loading patterns', 'Web Worker optimization'
  ],
  'cc20-3-1-indie-hacker-stack': [
    'Indie hacker tech stack', 'MVP development guide',
    'Startup analytics setup', 'Payment integration',
    'User feedback system', 'Feature flag management',
    'Customer support automation', 'Email marketing setup',
    'Startup legal basics', 'Scaling from 0 to 1000 users'
  ],
  'cc20-4-4-advanced-patterns': [
    'CQRS implementation', 'Event sourcing deep dive',
    'Domain-driven design', 'Clean architecture',
    'Hexagonal architecture', 'SOLID principles in practice',
    'Design patterns for APIs', 'Functional programming patterns',
    'Reactive programming', 'Observer pattern modern usage'
  ],
  'cc20-1-4-rag-evaluation': [
    'RAG evaluation frameworks', 'RAGAS metrics',
    'A/B testing for RAG', 'Ground truth creation',
    'RAG quality metrics', 'Retrieval evaluation',
    'Generation evaluation', 'End-to-end RAG testing',
    'RAG benchmarking', 'Production RAG monitoring'
  ],
  'ai-llm': [
    'Local LLM deployment guide', 'Open source LLM comparison',
    'LLM fine-tuning basics', 'Quantization techniques',
    'LLM serving infrastructure', 'LLM API optimization',
    'Prompt engineering for production', 'LLM caching strategies',
    'Multi-model routing', 'LLM cost optimization'
  ],
  'cc20-1-3-local-llm': [
    'Ollama production setup', 'LM Studio deployment',
    'Local embedding models', 'vLLM for inference',
    'Local LLM vs cloud LLM', 'Edge AI deployment',
    'CoreML model conversion', 'Local LLM fine-tuning',
    'Privacy-first AI architecture', 'Offline AI inference'
  ],
  'cc20-1-4-ai-productization': [
    'AI feature pricing strategy', 'Building AI SaaS product',
    'AI usage metering', 'AI product analytics',
    'AI model switching strategy', 'AI feature flags',
    'AI product user onboarding', 'AI trial to paid conversion',
    'AI product growth metrics', 'AI customer success'
  ],
  'cc20-1-1-ai-agent-development': [
    'Agent framework comparison', 'LangChain agent patterns',
    'AutoGPT architecture', 'Agent tool integration',
    'Agent state management', 'Multi-agent orchestration',
    'Agent evaluation metrics', 'Production agent deployment',
    'Agent safety patterns', 'Agent cost optimization'
  ],
  'cc20-2-2-dotnet-csharp': [
    '.NET 8 production patterns', 'C# async best practices',
    'Blazor component architecture', 'Entity Framework optimization',
    '.NET minimal APIs', 'C# 12 new features',
    '.NET microservices guide', 'ASP.NET Core security',
    '.NET performance tuning', 'C# design patterns'
  ],
  'cc20-2-4-devops-iac': [
    'Terraform module design', 'Pulumi vs Terraform',
    'AWS CDK best practices', 'Ansible automation',
    'GitOps with ArgoCD', 'Infrastructure testing',
    'Cloud cost monitoring', 'Multi-environment IaC',
    'Secret management in IaC', 'IaC drift detection'
  ],
  'cc20-3-1-digital-asset-matrix': [
    'Digital asset portfolio design', 'Crypto investment strategy',
    'NFT utility patterns', 'DeFi yield optimization',
    'Token economics design', 'On-chain analytics',
    'Digital asset custody', 'Portfolio rebalancing automation',
    'Cross-chain bridge security', 'Digital asset tax tracking'
  ],
  'cc20-3-4-personal-branding': [
    'Developer personal brand', 'Technical blog strategy',
    'Open source contribution', 'Conference speaking guide',
    'Technical writing tips', 'LinkedIn for developers',
    'GitHub profile optimization', 'YouTube tech channel',
    'Newsletter growth', 'Personal website SEO'
  ],
  'cc20-4-2-code-quality': [
    'Code review automation', 'Static analysis tools',
    'Linting at scale', 'TypeScript strict mode',
    'Code smell detection', 'Technical debt management',
    'Refactoring strategies', 'Code quality metrics',
    'Automated code review', 'SonarQube setup'
  ],
  'cc20-5-1-industry-insights': [
    'AI industry trends 2025', 'Developer tool market',
    'Cloud computing evolution', 'Open source business models',
    'Tech hiring trends', 'Startup funding landscape',
    'Remote work impact', 'AI regulation updates',
    'Developer experience trends', 'Platform engineering rise'
  ],
  'cc20-5-2-book-notes': [
    'Clean Architecture key takeaways', 'Design Patterns summary',
    'The Pragmatic Programmer insights', 'Refactoring patterns',
    'Domain-Driven Design notes', 'System Design Interview guide',
    'Staff Engineer lessons', 'Accelerate book insights',
    'Building Microservices notes', 'The Phoenix Project lessons'
  ],
  'cc20-5-3-case-studies': [
    'Netflix microservices migration', 'Spotify squad model',
    'Amazon two-pizza teams', 'Google SRE implementation',
    'Stripe API design', 'GitHub Actions case study',
    'Vercel deployment strategy', 'Shopify monolith to modular',
    'Meta React architecture', 'Airbnb design system'
  ],
  'cc20-2-scalable-backend-systems': [
    'Horizontal scaling patterns', 'Database sharding guide',
    'Load balancing strategies', 'Caching at scale',
    'Message queue architecture', 'Distributed locking',
    'Event sourcing at scale', 'CQRS implementation',
    'API gateway scaling', 'Backend performance monitoring'
  ],
  'cc20-cross-security-compliance': [
    'GDPR compliance guide', 'SOC2 certification process',
    'HIPAA for developers', 'PCI DSS requirements',
    'Security audit preparation', 'Vulnerability management',
    'Penetration testing guide', 'Security incident response',
    'Compliance automation', 'Zero Trust implementation'
  ],
  'cc20-cross-cost-sustainability': [
    'Cloud cost optimization', 'AWS cost reduction strategies',
    'Serverless cost analysis', 'Database cost optimization',
    'CDN cost management', 'Infrastructure right-sizing',
    'Cost monitoring tools', 'FinOps implementation',
    'Reserved instance strategy', 'Multi-cloud cost comparison'
  ],
  'cc20-cross-observability': [
    'OpenTelemetry setup', 'Distributed tracing guide',
    'Log aggregation patterns', 'Metrics dashboard design',
    'Alert management', 'Error tracking best practices',
    'SLO/SLI implementation', 'Incident postmortem guide',
    'Observability stack design', 'Production debugging'
  ],
};

// ── 主流程 ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1];
  const batchLimit = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '0');

  const startTime = Date.now();
  console.log('🔥 AI 文章深度重新生成');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  if (categoryFilter) console.log(`📂 限定分类: ${categoryFilter}`);
  if (batchLimit) console.log(`📦 批次限制: ${batchLimit} 篇/分类`);
  console.log('');

  // 查询所有分类的文章数（只统计 PUBLISHED）
  const { data: links } = await supabase.from('_ArticleToCategory').select('A, B');
  const { data: categories } = await supabase.from('Category').select('id, slug, name');
  const { data: articles } = await supabase.from('Article').select('id, status');

  if (!categories || !links || !articles) {
    console.log('❌ 无法获取分类数据');
    process.exit(1);
  }

  // 建立文章 ID → 状态映射
  const articleStatus: Record<string, string> = {};
  for (const a of articles) {
    articleStatus[a.id] = a.status;
  }

  // 统计每个分类的 PUBLISHED 文章数
  const counts: Record<string, number> = {};
  for (const cat of categories) {
    const catLinks = links.filter(l => l.B === cat.id);
    counts[cat.slug] = catLinks.filter(l => articleStatus[l.A] === 'PUBLISHED').length;
  }

  // 找出需要补录的分类
  const tasks: { slug: string; name: string; need: number; topics: string[] }[] = [];

  for (const cat of categories) {
    if (categoryFilter && cat.slug !== categoryFilter) continue;

    const currentCount = counts[cat.slug] || 0;
    const need = Math.max(0, 10 - currentCount);
    const topics = TOPIC_SEEDS[cat.slug];

    if (!topics) {
      console.log(`⚠️ ${cat.slug}: 未定义 topic 种子，跳过`);
      continue;
    }

    if (need <= 0) {
      console.log(`✅ ${cat.slug}: 已有 ${currentCount} 篇，达标`);
      continue;
    }

    const topicsToUse = batchLimit
      ? topics.slice(0, batchLimit)
      : topics.slice(0, need);

    tasks.push({ slug: cat.slug, name: cat.name, need: topicsToUse.length, topics: topicsToUse });
  }

  if (tasks.length === 0) {
    console.log('\n✅ 所有分类已达标！');
    return;
  }

  const total = tasks.reduce((s, t) => s + t.need, 0);
  console.log(`\n📋 生成计划: ${total} 篇文章，覆盖 ${tasks.length} 个分类`);
  console.log(`   预计时间: ~${Math.ceil(total * 2 / 60)} 小时\n`);

  let totalGenerated = 0;
  let totalPublished = 0;
  let totalFailed = 0;

  for (const task of tasks) {
    console.log(`\n📂 ${task.slug} (${task.name}) — 需要 ${task.need} 篇`);

    for (let i = 0; i < task.topics.length; i++) {
      const topic = task.topics[i];
      console.log(`  [${i + 1}/${task.topics.length}] ${topic}`);

      // 生成
      const result = await generateArticle(topic);
      if (!result) {
        console.log(`    ❌ 生成失败`);
        totalFailed++;
        continue;
      }

      // 评分
      console.log(`    📝 生成 ${result.content.length} 字，评分中...`);
      const scoring = await scoreArticle(result.title, result.content);

      if (scoring.score >= 60) {
        const ok = await insertArticle(
          result.title,
          result.content,
          scoring.score,
          scoring.dimensions,
          task.slug
        );

        if (ok) {
          console.log(`    🎉 发布成功 (评分: ${scoring.score})`);
          totalPublished++;
        } else {
          console.log(`    ❌ 入库失败`);
          totalFailed++;
        }
      } else {
        console.log(`    ❌ 评分 ${scoring.score} 低于 60，跳过`);
        totalFailed++;
      }

      totalGenerated++;

      // API 间隔（拉长避免 429）
      if (i < task.topics.length - 1) {
        await new Promise(r => setTimeout(r, 15000));
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 深度重新生成完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒 (${(Number(elapsed) / 60).toFixed(1)} 分钟)`);
  console.log(`📋 尝试生成: ${totalGenerated} 篇`);
  console.log(`✅ 成功发布 (≥60 分): ${totalPublished} 篇`);
  console.log(`❌ 失败 (<60 分或生成失败): ${totalFailed} 篇`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
