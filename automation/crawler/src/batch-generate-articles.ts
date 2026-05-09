#!/usr/bin/env node
/**
 * 按类别批量生成原创文章并入库
 *
 * 对空分类和薄弱分类生成 Codcompass 2.0 标准格式文章，直接入库。
 * 100% 原创，无版权风险。
 *
 * Usage:
 *   npx tsx src/batch-generate-articles.ts
 *   npx tsx src/batch-generate-articles.ts --category security
 *   npx tsx src/batch-generate-articles.ts --target 50
 *   npx tsx src/batch-generate-articles.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '..', '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Configuration ──────────────────────────────────────────────────────────

const TARGET_PER_CATEGORY = Number(process.env.ARTICLE_TARGET_PER_CATEGORY || 10);
const INTERVAL_MS = 5000; // 5s between articles to avoid 429
const GENERATE_MAX_RETRIES = 3;
const GENERATE_TIMEOUT_MS = 120000;

// ── Category Definitions ──────────────────────────────────────────────────

interface CategoryDef {
  slug: string;
  name: string;
  topics: string[]; // Topic seeds for article generation
}

const CATEGORY_DEFINITIONS: CategoryDef[] = [
  // Empty categories (0 articles)
  {
    slug: 'api',
    name: 'API 开发',
    topics: [
      'REST API design best practices', 'GraphQL vs REST comparison',
      'API versioning strategies', 'Rate limiting and throttling',
      'API authentication patterns (OAuth2, JWT, API keys)',
      'OpenAPI/Swagger documentation', 'API gateway architecture',
      'gRPC for high-performance APIs', 'Webhook design patterns',
      'API testing strategies', 'API caching with Redis',
      'Idempotent API design', 'HATEOAS and API maturity',
      'API monitoring and observability', 'Building public APIs',
      'API deprecation strategies', 'Microservices API composition',
      'API response pagination patterns', 'API error handling standards',
      'API content negotiation', 'Async API with Server-Sent Events',
      'API design for mobile clients', 'Batch API operations',
      'API security headers', 'GraphQL federation',
      'API contract testing', 'Building API SDKs',
      'API rate limit bypass prevention', 'API changelog management',
      'API analytics and usage tracking', 'Edge computing for APIs',
      'API mocking for development', 'API blue-green deployment',
      'API request validation', 'API performance optimization',
      'API documentation automation', 'API sandbox environments',
      'API dependency management', 'API load testing',
      'API schema evolution', 'API backward compatibility',
      'API request deduplication', 'API circuit breaker patterns',
      'API timeout configuration', 'API retry strategies',
      'API bulkhead pattern', 'API service mesh integration',
      'API canary releases', 'API traffic shaping',
      'API token rotation'
    ]
  },
  {
    slug: 'frontend',
    name: '前端框架',
    topics: [
      'React Server Components deep dive', 'Next.js App Router patterns',
      'Vue 3 Composition API best practices', 'Svelte 5 runes explained',
      'Angular signals and reactivity', 'State management comparison 2026',
      'CSS-in-JS vs Tailwind vs CSS Modules', 'Web performance optimization',
      'Accessibility (a11y) in modern web apps', 'Micro-frontend architecture',
      'React hooks performance optimization', 'Next.js middleware patterns',
      'Building custom React hooks', 'Web Vitals optimization guide',
      'Progressive Web Apps in 2026', 'React 19 concurrent rendering',
      'Form validation patterns in React', 'Image optimization strategies',
      'Client-side routing best practices', 'Shadow DOM and web components',
      'React error boundaries patterns', 'SSR vs SSG vs ISR comparison',
      'React memoization techniques', 'Bundle size optimization',
      'Frontend testing strategies', 'React animation patterns',
      'Dark mode implementation guide', 'CSS Grid vs Flexbox guide',
      'Web assembly for frontend developers', 'React query data fetching',
      'Zustand vs Redux vs Jotai comparison', 'Next.js dynamic imports',
      'React Suspense patterns', 'Frontend caching strategies',
      'Virtual scrolling implementation', 'React performance profiling',
      'Web accessibility audit guide', 'Frontend CI/CD pipelines',
      'React component library design', 'Design system implementation',
      'Frontend monitoring and error tracking', 'React form patterns',
      'CSS architecture for large apps', 'Frontend internationalization',
      'React context vs prop drilling', 'Frontend build optimization',
      'React lazy loading patterns', 'CSS container queries',
      'Frontend security (XSS, CSRF)', 'React state machines (XState)'
    ]
  },
  {
    slug: 'backend',
    name: '后端技术',
    topics: [
      'Node.js event loop deep dive', 'Microservices communication patterns',
      'Database connection pooling', 'Message queue comparison (RabbitMQ vs Kafka)',
      'Backend authentication architecture', 'CQRS and Event Sourcing patterns',
      'Background job processing', 'Rate limiting at scale',
      'API gateway patterns', 'Distributed tracing with OpenTelemetry',
      'Database sharding strategies', 'Caching strategies for backend',
      'GraphQL server implementation', 'WebSocket scaling patterns',
      'Backend monitoring and alerting', 'Container orchestration basics',
      'Database indexing optimization', 'Backend testing strategies',
      'Saga pattern for distributed transactions', 'Circuit breaker implementation',
      'Load balancing algorithms', 'Backend logging best practices',
      'Database migration strategies', 'Backend deployment patterns',
      'Serverless backend architecture', 'Backend API versioning',
      'Database backup and recovery', 'Backend security hardening',
      'Event-driven architecture patterns', 'Backend performance profiling',
      'Database query optimization', 'Backend retry patterns',
      'Distributed lock implementation', 'Backend configuration management',
      'Database connection management', 'Backend health checks',
      'Database replication strategies', 'Backend chaos engineering',
      'Database transaction isolation', 'Backend feature flags',
      'Database partitioning guide', 'Backend rate limiting strategies',
      'Database schema design patterns', 'Backend error handling',
      'Database indexing strategies', 'Backend observability',
      'Database query planning', 'Backend service discovery',
      'Database concurrency control', 'Backend secrets management'
    ]
  },
  {
    slug: 'mobile',
    name: '移动开发',
    topics: [
      'SwiftUI layout system explained', 'React Native performance optimization',
      'Flutter widget architecture', 'iOS app lifecycle management',
      'Android ViewModel and state', 'Cross-platform vs native development',
      'Mobile app architecture patterns', 'Push notification strategies',
      'Mobile app testing guide', 'Offline-first mobile apps',
      'Mobile app security best practices', 'Swift concurrency (async/await)',
      'Kotlin coroutines in Android', 'Mobile CI/CD pipelines',
      'App Store optimization (ASO)', 'Mobile deep linking',
      'React Native bridge optimization', 'Flutter state management',
      'iOS memory management', 'Android background processing',
      'Mobile app analytics', 'React Native navigation patterns',
      'Mobile app performance profiling', 'Flutter plugin development',
      'iOS app extensions', 'Android WorkManager guide',
      'Mobile app onboarding design', 'SwiftUI data flow',
      'Mobile app localization', 'React Native performance tips',
      'Mobile app crash reporting', 'Flutter testing strategies',
      'iOS Core Data guide', 'Android Room database',
      'Mobile app monetization', 'React Native animations',
      'Mobile app accessibility', 'Flutter responsive design',
      'iOS Widget development', 'Android Jetpack Compose',
      'Mobile app privacy compliance', 'React Native debugging',
      'Mobile app distribution', 'Flutter architecture patterns',
      'iOS networking (URLSession)', 'Android networking (Retrofit)',
      'Mobile app CI/CD', 'React Native custom modules',
      'Mobile app design systems', 'Flutter platform channels'
    ]
  },
  {
    slug: 'product',
    name: '产品/创业',
    topics: [
      'Product-market fit indicators', 'SaaS pricing strategies',
      'User onboarding optimization', 'Growth metrics that matter',
      'Lean startup methodology', 'Product roadmap planning',
      'Customer development interviews', 'A/B testing best practices',
      'Startup fundraising guide', 'MVP definition and validation',
      'Product analytics setup', 'User retention strategies',
      'Churn reduction tactics', 'Product-led growth strategies',
      'Building a startup team', 'Competitive analysis framework',
      'Product discovery process', 'Feature prioritization methods',
      'User research techniques', 'Startup financial modeling',
      'Product launch strategies', 'Community building for startups',
      'Customer feedback loops', 'Startup legal basics',
      'Product vision and strategy', 'Market sizing and TAM',
      'Startup pitch deck guide', 'Product experiment design',
      'User segmentation strategies', 'Startup burn rate management',
      'Product positioning framework', 'Startup growth hacking',
      'Customer success metrics', 'Product analytics dashboard',
      'Startup founder mental health', 'Product storytelling',
      'Startup hiring strategies', 'Product roadmap communication',
      'Customer lifetime value', 'Startup equity distribution',
      'Product differentiation strategy', 'Startup partnership strategies',
      'Product feedback prioritization', 'Startup go-to-market',
      'Product pricing psychology', 'Startup runway planning',
      'Product feature discovery', 'Startup customer acquisition',
      'Product launch checklist', 'Startup investor relations'
    ]
  },
  {
    slug: 'devops',
    name: 'DevOps',
    topics: [
      'CI/CD pipeline best practices', 'Docker containerization guide',
      'Kubernetes deployment patterns', 'Infrastructure as Code with Terraform',
      'GitOps workflow implementation', 'Monitoring and alerting setup',
      'Log aggregation with ELK stack', 'Cloud cost optimization',
      'Database backup automation', 'Blue-green deployment strategy',
      'Canary releases guide', 'Service mesh with Istio',
      'Container security scanning', 'Infrastructure monitoring',
      'Disaster recovery planning', 'Secrets management with Vault',
      'Multi-cloud architecture', 'Edge computing deployment',
      'Automated testing in CI/CD', 'Kubernetes networking guide',
      'Docker compose for production', 'Terraform modules design',
      'Ansible automation patterns', 'Cloud migration strategies',
      'DevOps culture transformation', 'Site Reliability Engineering',
      'Incident response procedures', 'Capacity planning guide',
      'Performance testing automation', 'Container image optimization',
      'Kubernetes autoscaling', 'Git branching strategies',
      'DevOps metrics (DORA)', 'Cloud resource tagging',
      'Database migration automation', 'Zero-downtime deployments',
      'DevOps toolchain guide', 'Container registry management',
      'Kubernetes storage patterns', 'Infrastructure drift detection',
      'DevOps security (DevSecOps)', 'Cloud-native architecture',
      'Kubernetes operators guide', 'CI/CD for microservices',
      'Infrastructure cost tracking', 'Container orchestration comparison',
      'DevOps onboarding guide', 'Cloud governance framework',
      'Kubernetes networking deep dive', 'DevOps compliance automation'
    ]
  },
  {
    slug: 'database',
    name: 'Database',
    topics: [
      'PostgreSQL performance tuning', 'Redis caching patterns',
      'Database indexing strategies', 'pgvector for semantic search',
      'Database connection pooling', 'NoSQL vs SQL comparison',
      'Database migration tools', 'Query optimization techniques',
      'Database backup strategies', 'Data modeling best practices',
      'Database replication setup', 'Transaction isolation levels',
      'Database sharding guide', 'Time-series database selection',
      'Graph database use cases', 'Database security hardening',
      'Database monitoring guide', 'Data pipeline architecture',
      'Database version control', 'Read replica optimization',
      'Database partitioning guide', 'Data warehouse design',
      'Database concurrency patterns', 'ETL vs ELT comparison',
      'Database schema evolution', 'Data quality frameworks',
      'Database disaster recovery', 'Caching invalidation strategies',
      'Database performance profiling', 'Multi-tenant database design',
      'Database connection management', 'Data encryption at rest',
      'Database query planning', 'CDC (Change Data Capture)',
      'Database indexing internals', 'Data lake architecture',
      'Database migration best practices', 'Database performance testing',
      'Database locking strategies', 'Data governance frameworks',
      'Database capacity planning', 'Data archival strategies',
      'Database backup testing', 'Data synchronization patterns',
      'Database high availability', 'Data lineage tracking',
      'Database cost optimization', 'Data mesh architecture',
      'Database security audit', 'Data retention policies'
    ]
  },
  {
    slug: 'security',
    name: 'Security',
    topics: [
      'Zero-trust architecture guide', 'OAuth2 and OpenID Connect',
      'API security best practices', 'Secrets management patterns',
      'Encryption at rest and in transit', 'Security audit automation',
      'Penetration testing guide', 'Supply chain security for devs',
      'Dependency vulnerability scanning', 'CSP and security headers',
      'XSS prevention techniques', 'CSRF protection patterns',
      'Password hashing best practices', 'Multi-factor authentication',
      'Security incident response', 'Container security scanning',
      'Infrastructure security (IaC)', 'Security compliance (SOC2)',
      'Data privacy (GDPR) guide', 'JWT security best practices',
      'Rate limiting for security', 'Security logging and monitoring',
      'Cloud security checklist', 'API key management',
      'Security testing in CI/CD', 'Webhook security',
      'Database security hardening', 'TLS/SSL configuration guide',
      'Security threat modeling', 'Kubernetes security patterns',
      'Security automation with IaC', 'Secure coding practices',
      'Vulnerability disclosure process', 'Security code review',
      'Identity and access management', 'Security audit logging',
      'Data encryption key rotation', 'Security posture assessment',
      'Network security basics', 'Application firewall (WAF)',
      'Security metrics and KPIs', 'Incident response automation',
      'Security training for devs', 'Cloud access security broker',
      'Security risk assessment', 'Data loss prevention',
      'Security compliance automation', 'Secure API design',
      'Security architecture review', 'DevSecOps implementation'
    ]
  },
  {
    slug: 'ai-llm',
    name: 'AI & LLM',
    topics: [
      'LLM cost optimization strategies', 'RAG architecture patterns',
      'Fine-tuning vs prompt engineering', 'AI agent design patterns',
      'Vector database comparison', 'LLM evaluation frameworks',
      'AI prompt injection prevention', 'Multi-model routing systems',
      'AI caching and response optimization', 'Embedding model selection',
      'LLM context window management', 'AI-powered code review',
      'Retrieval strategies for RAG', 'AI observability and monitoring',
      'LLM output validation', 'AI model benchmarking',
      'Structured output with LLMs', 'AI-powered testing',
      'LLM token optimization', 'AI workflow orchestration',
      'Knowledge graph + LLM integration', 'AI content moderation',
      'LLM hallucination mitigation', 'AI-powered search implementation',
      'LLM API rate limiting', 'AI data privacy patterns',
      'On-device LLM deployment', 'AI-powered documentation',
      'LLM training data preparation', 'AI-powered summarization',
      'LLM streaming responses', 'AI-powered code generation',
      'LLM function calling patterns', 'AI-powered translation',
      'LLM memory management', 'AI-powered recommendation systems',
      'LLM safety guardrails', 'AI-powered data extraction',
      'LLM multi-turn conversations', 'AI-powered anomaly detection',
      'LLM prompt chaining', 'AI-powered sentiment analysis',
      'LLM batch processing', 'AI-powered content classification',
      'LLM tool use patterns', 'AI-powered knowledge management',
      'LLM deployment strategies', 'AI-powered data cleaning',
      'LLM versioning', 'AI-powered customer support'
    ]
  },
  // More empty categories...
  {
    slug: 'cc20-2-2-dotnet-csharp',
    name: '.NET / C# Advanced Development',
    topics: [
      '.NET 9 performance improvements', 'C# 13 language features',
      'ASP.NET Core middleware patterns', 'Entity Framework optimization',
      'C# async/await best practices', 'Dependency injection in .NET',
      'Minimal APIs vs Controllers', '.NET testing strategies',
      'C# pattern matching guide', 'Blazor vs MVC comparison',
      '.NET microservices patterns', 'C# records and value types',
      'ASP.NET Core authentication', '.NET background services',
      'C# generics deep dive', '.NET distributed caching',
      'ASP.NET Core health checks', 'C# source generators',
      '.NET container optimization', 'ASP.NET Core rate limiting',
      'C# nullable reference types', '.NET logging best practices',
      'ASP.NET Core gRPC services', 'C# LINQ performance',
      '.NET API versioning', 'ASP.NET Core output caching',
      'C# memory management', '.NET configuration patterns',
      'ASP.NET Core SignalR', 'C# extension methods guide',
      '.NET security best practices', 'ASP.NET Core middleware order',
      'C# delegates and events', '.NET performance profiling',
      'ASP.NET Core filter pipelines', 'C# async streams',
      '.NET database migrations', 'ASP.NET Core model validation',
      'C# reflection optimization', '.NET deployment strategies',
      'ASP.NET Core error handling', 'C# pattern matching in practice',
      '.NET API design patterns', 'ASP.NET Core middleware testing',
      'C# expression trees', '.NET cloud-native development',
      'ASP.NET Core CORS configuration', 'C# task parallel library',
      '.NET API documentation', 'ASP.NET Core request pipeline'
    ]
  },
  {
    slug: 'cc20-3-1-digital-asset-matrix',
    name: '数字资产与产品矩阵',
    topics: [
      'Building a digital product portfolio', 'SaaS product line strategy',
      'API as a product', 'Digital asset valuation methods',
      'Product matrix for indie developers', 'Content monetization strategies',
      'Digital course creation guide', 'Subscription business models',
      'Product bundling strategies', 'Digital product pricing tiers',
      'Marketplace vs direct sales', 'Digital asset distribution channels',
      'Product lifecycle management', 'Digital product analytics',
      'Cross-promotion strategies', 'Digital product launch sequence',
      'Freemium model design', 'Digital product retention tactics',
      'Product portfolio diversification', 'Digital asset creation workflow',
      'Revenue stream optimization', 'Digital product customer journey',
      'Product market expansion', 'Digital product upselling',
      'Asset-light business models', 'Digital product experimentation',
      'Product cannibalization prevention', 'Digital product localization',
      'Revenue forecasting for digital products', 'Digital product feedback loops',
      'Product portfolio analytics', 'Digital product onboarding',
      'Cross-product integration', 'Digital product pricing psychology',
      'Product ecosystem building', 'Digital product community building',
      'Product roadmap alignment', 'Digital product competitive analysis',
      'Revenue attribution across products', 'Digital product feature prioritization',
      'Product portfolio risk assessment', 'Digital product scaling',
      'Cross-selling strategies', 'Digital product content strategy',
      'Product acquisition metrics', 'Digital product brand building',
      'Product synergy identification', 'Digital product exit strategy',
      'Revenue concentration risk', 'Digital product innovation pipeline',
      'Product portfolio optimization'
    ]
  },
  {
    slug: 'cc20-3-4-personal-branding',
    name: '个人品牌与变现',
    topics: [
      'Developer personal branding guide', 'Building audience as a developer',
      'Technical writing for visibility', 'Speaking at conferences',
      'Open source contribution strategy', 'Newsletter growth tactics',
      'Social media for developers', 'Portfolio website design',
      'Content creation workflow', 'Monetizing technical expertise',
      'Building a developer brand on X', 'Consulting rate setting',
      'Personal brand differentiation', 'Technical blog writing guide',
      'YouTube for developers', 'Community building online',
      'Personal brand monetization', 'Developer reputation management',
      'Content repurposing strategies', 'Personal brand consistency',
      'Technical influencer growth', 'Developer side income streams',
      'Personal brand positioning', 'Writing technical tutorials',
      'Developer networking online', 'Personal brand voice and tone',
      'Content calendar for devs', 'Developer brand partnerships',
      'Personal brand measurement', 'Technical speaking preparation',
      'Developer brand crisis management', 'Building email list as a dev',
      'Personal brand authenticity', 'Developer brand storytelling',
      'Content monetization for devs', 'Personal brand scaling',
      'Developer brand collaboration', 'Personal brand platform choice',
      'Developer brand audience building', 'Personal brand thought leadership',
      'Technical content distribution', 'Developer brand engagement',
      'Personal brand value proposition', 'Developer brand consistency',
      'Personal brand growth hacking', 'Developer brand analytics',
      'Personal brand revenue models', 'Developer brand authority building',
      'Personal brand sustainability', 'Developer brand community engagement'
    ]
  },
  {
    slug: 'cc20-5-1-industry-insights',
    name: '行业趋势与洞察',
    topics: [
      'AI industry trends 2026', 'Cloud computing evolution',
      'Developer tools market analysis', 'SaaS industry outlook',
      'Open source business models', 'Tech startup funding trends',
      'Remote work technology impact', 'Cybersecurity market trends',
      'Database technology evolution', 'API economy growth',
      'Low-code/no-code market', 'Edge computing adoption',
      'Quantum computing readiness', 'Green technology in software',
      'Web3 reality vs hype', 'AI regulation impact',
      'Platform engineering rise', 'Developer experience trends',
      'Microservices future', 'Data privacy regulation',
      'Cloud cost optimization trends', 'AI ethics in development',
      'Tech talent market shifts', 'Software architecture evolution',
      'Mobile development trends', 'Backend technology shifts',
      'Frontend framework wars', 'DevOps industry consolidation',
      'Database market trends', 'AI developer tools market',
      'Open source sustainability', 'Cloud provider competition',
      'Tech layoffs and hiring', 'Developer productivity tools',
      'API-first companies', 'Cloud-native adoption',
      'AI-powered development', 'Software security trends',
      'Tech industry consolidation', 'Developer tool monetization',
      'Cloud cost trends', 'AI model competition',
      'Developer community trends', 'Tech stack evolution',
      'Software delivery metrics', 'Platform engineering adoption',
      'AI coding assistant market', 'Developer experience measurement',
      'Tech industry regulation', 'Software architecture trends'
    ]
  },
  {
    slug: 'cc20-5-2-book-notes',
    name: '读书笔记与心智模型',
    topics: [
      'Clean Architecture key takeaways', 'Design Patterns summary',
      'The Pragmatic Programmer lessons', 'Domain-Driven Design guide',
      'Building Microservices notes', 'Release It! resilience patterns',
      'Accelerate DORA metrics summary', 'The Phoenix Project insights',
      'Staff Engineer book summary', 'An Elegant Puzzle lessons',
      'System Design Interview notes', 'Grokking algorithms summary',
      'Refactoring techniques guide', 'Working Effectively with Legacy Code',
      'The DevOps Handbook lessons', 'Site Reliability Engineering notes',
      'Clean Code applicable patterns', 'Head First Design Patterns',
      'You Are Not a Smart Machine', 'Thinking in Systems summary',
      'The Lean Startup key lessons', 'Zero to One takeaways',
      'The Hard Thing About Hard Things', 'Inspired product notes',
      'Measure What Matters OKR guide', 'Atomic Habits for developers',
      'Deep Work productivity lessons', 'The Mythical Man-Month',
      'Code Complete best practices', 'The Art of Computer Programming',
      'Structure and Interpretation', 'Introduction to Algorithms notes',
      'Database Internals summary', 'Designing Data-Intensive Apps notes',
      'Kubernetes Patterns summary', 'Cloud Native Patterns notes',
      'Fundamentals of Software Architecture', 'Software Architecture: The Hard Parts',
      'Monolith to Microservices notes', 'Building Evolutionary Architectures',
      'API Design Patterns summary', 'REST API Design Rulebook',
      'GraphQL in Action notes', 'Event-Driven Architecture notes',
      'Reactive Systems design notes', 'The Tao of Microservices',
      'Microservices in Practice notes', 'Serverless Patterns summary',
      'The Well-Grounded Java Developer', 'Effective Java lessons'
    ]
  },
  {
    slug: 'cc20-5-3-case-studies',
    name: '案例研究与项目复盘',
    topics: [
      'Scaling a startup to 1M users', 'Migrating monolith to microservices',
      'Building a SaaS from scratch', 'Database migration at scale',
      'Implementing CI/CD at enterprise', 'Zero-downtime deployment case study',
      'Building an AI-powered product', 'Scaling API to 100M requests',
      'Resolving production outage', 'Building a design system',
      'Implementing observability stack', 'Multi-tenant architecture case study',
      'Building a real-time platform', 'Migrating to serverless architecture',
      'Implementing zero-trust security', 'Building a data pipeline',
      'Scaling a mobile app globally', 'Implementing event-driven architecture',
      'Building a marketplace platform', 'Migrating from REST to GraphQL',
      'Implementing microservices monitoring', 'Building a recommendation engine',
      'Scaling database to petabytes', 'Implementing ML in production',
      'Building a content delivery network', 'Migrating to Kubernetes',
      'Implementing distributed tracing', 'Building a search engine',
      'Scaling notification system', 'Implementing feature flags',
      'Building a payments platform', 'Migrating to event sourcing',
      'Implementing rate limiting at scale', 'Building a video streaming service',
      'Scaling email delivery system', 'Implementing chaos engineering',
      'Building a multi-region platform', 'Migrating to service mesh',
      'Implementing database sharding', 'Building a real-time chat system',
      'Scaling image processing pipeline', 'Implementing canary deployments',
      'Building a fraud detection system', 'Migrating to cloud-native',
      'Implementing data governance', 'Building a search recommendation system',
      'Scaling analytics pipeline', 'Implementing A/B testing platform',
      'Building a notification system', 'Migrating to micro-frontends'
    ]
  },
];

// ── Weak categories (need topping up to 50) ───────────────────────────────

const WEAK_CATEGORIES: { slug: string; current: number; name: string }[] = [
  { slug: 'cc20-3-2-growth-traffic', current: 1, name: '增长与流量系统' },
  { slug: 'cc20-3-3-one-person-os', current: 1, name: '一人公司操作系统' },
];

// ── AI Generation ──────────────────────────────────────────────────────────

async function generateArticleWithAI(topic: string, categorySlug: string): Promise<string | null> {
  const systemPrompt = `You are a senior technical editor writing for Codcompass, a premium developer knowledge base.

Write a comprehensive, original technical article about: "${topic}"

═══════════════════════════════════════════════════
 CODCOMPASS 2.0 ARTICLE STRUCTURE (mandatory)
═══════════════════════════════════════════════════

## Current Situation Analysis
- The industry pain point this topic addresses
- Why this problem is overlooked or misunderstood
- Data-backed evidence

## WOW Moment: Key Findings
- A data comparison table showing the key insight
- Why this finding matters

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|
| [Option A] | [data] | [data] | [data] |
| [Option B] | [data] | [data] | [data] |

## Core Solution
- Step-by-step technical implementation
- Code examples (TypeScript unless topic requires otherwise)
- Architecture decisions and rationale

## Pitfall Guide
- 5-7 common mistakes with detailed explanations
- Best practices from real production experience

## Production Bundle (MUST include all 4 subsections)

### Action Checklist
- 5-8 actionable checklist items
- Format: "- [ ] Step name: brief explanation"

### Decision Matrix
- A comparison table to help readers choose

| Scenario | Recommended Approach | Why | Cost Impact |
|----------|---------------------|-----|-------------|
| [Case A] | [Approach] | [Reason] | [Impact] |

### Configuration Template
- Ready-to-copy configuration or code template

### Quick Start Guide
- 3-5 steps to get running in under 5 minutes

═══════════════════════════════════════════════════
 OUTPUT FORMAT
═══════════════════════════════════════════════════

- Markdown format
- English language
- Keep technical terms as-is
- 2000-4000 words
- Professional, direct tone
- No fluff, no filler, no "In today's world" intros
- 100% original content — do NOT copy from any existing article`;

  for (let attempt = 1; attempt <= GENERATE_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        const backoffMs = 2000 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, backoffMs));
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS);

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
            { role: 'user', content: `Write a comprehensive technical article about: "${topic}"\n\nCategory: ${categorySlug}` },
          ],
          max_tokens: 8000,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          console.log(`    ⚠️ 429 rate limited, attempt ${attempt}/${GENERATE_MAX_RETRIES}`);
          if (attempt < GENERATE_MAX_RETRIES) continue;
          return null;
        }
        if (status >= 500) {
          console.log(`    ⚠️ Server error ${status}, attempt ${attempt}/${GENERATE_MAX_RETRIES}`);
          if (attempt < GENERATE_MAX_RETRIES) continue;
          return null;
        }
        const body = await response.text().catch(() => '');
        console.log(`    ❌ API error: ${status} ${body.slice(0, 200)}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content || content.trim().length < 500) {
        console.log(`    ⚠️ Empty/short content, attempt ${attempt}/${GENERATE_MAX_RETRIES}`);
        if (attempt < GENERATE_MAX_RETRIES) continue;
        return null;
      }

      return content;
    } catch (error: any) {
      const msg = error.message || String(error);
      const isAbort = msg.includes('abort') || msg.includes('timed out') || msg.includes('AbortError');
      if (isAbort) {
        console.log(`    ⚠️ Timed out (${GENERATE_TIMEOUT_MS}ms), attempt ${attempt}/${GENERATE_MAX_RETRIES}`);
      } else {
        console.log(`    ⚠️ Network error: ${msg.slice(0, 150)}, attempt ${attempt}/${GENERATE_MAX_RETRIES}`);
      }
      if (attempt >= GENERATE_MAX_RETRIES) return null;
    }
  }

  return null;
}

// ── Database Insert ───────────────────────────────────────────────────────

async function insertArticle(
  title: string,
  content: string,
  categorySlug: string,
): Promise<{ success: boolean; articleId?: string; error?: string }> {
  const articleId = crypto.randomUUID();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60)}-${Date.now().toString(36).slice(-6)}`;
  const now = new Date().toISOString();

  const { error: insertError } = await supabase
    .from('Article')
    .insert({
      id: articleId,
      slug,
      titleEn: title,
      contentEn: content,
      excerptEn: content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200),
      sourceSite: 'ai-generated',
      crawledAt: now,
      status: 'PUBLISHED',
      qualityScore: 80,
      qualityDetails: {
        score: 80,
        is_ai_generated: true,
        generated_at: now,
        topic_seed: 'batch-generation',
        difficulty_level: 'L2',
      },
      isPublished: true,
      publishedAt: now,
      isPremium: false,
      createdAt: now,
      updatedAt: now,
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Link to category
  const { data: category } = await supabase
    .from('Category')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (category) {
    await supabase.from('_ArticleToCategory').insert({
      A: articleId,
      B: category.id,
    });
  }

  return { success: true, articleId };
}

// ── Extract Title from Markdown ──────────────────────────────────────────

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    const title = match[1].trim();
    if (title.length > 5 && title.length < 200) return title;
  }
  return fallback;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let targetCategory: string | null = null;
  let targetCount = TARGET_PER_CATEGORY;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      targetCategory = args[++i];
    } else if (args[i] === '--target' && args[i + 1]) {
      targetCount = parseInt(args[++i], 10);
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  // Get current article counts per category
  const { data: links } = await supabase.from('_ArticleToCategory').select('A, B');
  const { data: categories } = await supabase.from('Category').select('id, slug');

  const counts: Record<string, number> = {};
  for (const cat of categories || []) {
    const c = (links || []).filter(l => l.B === cat.id).length;
    counts[cat.slug] = c;
  }

  // Build task list
  const tasks: { category: CategoryDef; count: number }[] = [];

  for (const cat of CATEGORY_DEFINITIONS) {
    const current = counts[cat.slug] || 0;
    const need = Math.max(0, targetCount - current);

    if (targetCategory && cat.slug !== targetCategory) continue;
    if (need === 0) continue;

    tasks.push({ category: cat, count: Math.min(need, cat.topics.length) });
  }

  // Also handle weak categories
  for (const weak of WEAK_CATEGORIES) {
    const current = counts[weak.slug] || 0;
    const need = Math.max(0, targetCount - current);
    if (targetCategory && weak.slug !== targetCategory) continue;
    if (need === 0) continue;

    // Find matching definition or create one
    const existing = CATEGORY_DEFINITIONS.find(c => c.slug === weak.slug);
    if (existing) continue; // already handled

    tasks.push({
      category: { slug: weak.slug, name: weak.name, topics: [`Topic for ${weak.slug}`] },
      count: Math.min(need, 50),
    });
  }

  const totalArticles = tasks.reduce((sum, t) => sum + t.count, 0);

  if (totalArticles === 0) {
    console.log('✅ All categories already meet target!');
    return;
  }

  console.log('📋 Article Generation Plan');
  console.log('='.repeat(60));
  for (const task of tasks) {
    console.log(`   ${task.category.name.padEnd(40)} ${task.category.slug.padEnd(35)} ${task.count} articles (current: ${counts[task.category.slug] || 0})`);
  }
  console.log(`\n   Total: ${totalArticles} articles`);
  console.log(`   Est. time: ${Math.ceil(totalArticles * 1.5 / 60)} hours (${(totalArticles * 5 / 60 / 60).toFixed(1)}h at 5s interval)`);

  if (dryRun) {
    console.log('\n🔍 Dry run mode. No articles will be generated.');
    return;
  }

  console.log('\n🚀 Starting article generation...\n');

  const startTime = Date.now();
  let totalSuccess = 0;
  let totalFail = 0;

  for (const task of tasks) {
    const { category, count } = task;
    console.log(`\n📂 ${category.name} (${category.slug}) — ${count} articles`);

    const topics = category.topics.slice(0, count);

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const globalIdx = totalSuccess + totalFail + 1;
      console.log(`  [${globalIdx}/${totalArticles}] ${topic}`);

      const content = await generateArticleWithAI(topic, category.slug);

      if (!content) {
        console.log(`    ❌ Failed to generate`);
        totalFail++;
        continue;
      }

      const title = extractTitle(content, topic);
      const result = await insertArticle(title, content, category.slug);

      if (result.success) {
        console.log(`    ✅ "${title.slice(0, 50)}..."`);
        totalSuccess++;
      } else {
        console.log(`    ❌ Insert failed: ${result.error}`);
        totalFail++;
      }

      // Progress
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = globalIdx / (elapsed / 60);
      const remaining = totalArticles - globalIdx;
      const eta = remaining / rate;

      console.log(`    📊 ${globalIdx}/${totalArticles} | ✅${totalSuccess} ❌${totalFail} | ETA: ${Math.ceil(eta)}min`);

      // Interval between articles
      if (i < topics.length - 1) {
        await new Promise(r => setTimeout(r, INTERVAL_MS));
      }
    }

    // Brief pause between categories
    if (tasks.indexOf(task) < tasks.length - 1) {
      console.log(`   ⏳ Pausing 10s before next category...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log('\n' + '='.repeat(60));
  console.log('✅ Article generation completed!');
  console.log(`   Success:  ${totalSuccess}`);
  console.log(`   Failed:   ${totalFail}`);
  console.log(`   Time:     ${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`);
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
