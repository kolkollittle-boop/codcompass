/**
 * Codcompass 2.0 KB taxonomy: sections aligned with lib/kb-nav-tree pillars (1.1–5.3).
 * Used by lib/categories.ts (browse/filter UI) and scripts/remap-articles-cc20-categories.ts.
 */

import type { CategoryInfo } from '@/lib/category-types';

/** Primary section when slug has no explicit mapping. */
export const CC20_DEFAULT_SECTION_SLUG = 'cc20-4-1-tools-efficiency';

/** Browse/filter categories (second level of the CC20 tree). */
export const CC20_SECTIONS: CategoryInfo[] = [
  // 01 AI Agents & Automation
  {
    slug: 'cc20-1-1-ai-agent-development',
    name: '1.1 AI Agent Development & Orchestration',
    nameZh: '1.1 AI Agent Development & Orchestration',
    description: 'Agents, tooling, orchestration, evaluation',
    descriptionEn: 'Agents, tooling, orchestration, evaluation',
    icon: '🤖',
    color: 'from-violet-500 to-purple-600',
  },
  {
    slug: 'cc20-1-2-enterprise-rag',
    name: '1.2 Enterprise RAG & Knowledge Engines',
    nameZh: '1.2 Enterprise RAG & Knowledge Engines',
    description: 'RAG systems, embeddings, vector retrieval, pipelines',
    descriptionEn: 'RAG systems, embeddings, vector retrieval, pipelines',
    icon: '🤖',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    slug: 'cc20-1-3-local-llm',
    name: '1.3 Local LLM Deployment & Optimization',
    nameZh: '1.3 Local LLM Deployment & Optimization',
    description: 'On-device LLMs, fine-tuning, quantization, cost/performance',
    descriptionEn: 'On-device LLMs, fine-tuning, quantization, cost/performance',
    icon: '🤖',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    slug: 'cc20-1-4-ai-productization',
    name: '1.4 AI Productization & Commercialization',
    nameZh: '1.4 AI Productization & Commercialization',
    description: 'Shipping AI products and GTM',
    descriptionEn: 'Shipping AI products and GTM',
    icon: '🤖',
    color: 'from-indigo-500 to-blue-600',
  },
  // 02 Enterprise Architecture
  {
    slug: 'cc20-2-1-architecture-transformation',
    name: '2.1 Architecture Transformation',
    nameZh: '2.1 Architecture Transformation',
    description: 'Modernization, migrations, microservices, cloud-native',
    descriptionEn: 'Modernization, migrations, microservices, cloud-native',
    icon: '🏗️',
    color: 'from-slate-500 to-zinc-600',
  },
  {
    slug: 'cc20-2-2-dotnet-csharp',
    name: '2.2 .NET / C# Advanced Development',
    nameZh: '2.2 .NET / C# Advanced Development',
    description: 'High-performance .NET stacks and patterns',
    descriptionEn: 'High-performance .NET stacks and patterns',
    icon: '🏗️',
    color: 'from-blue-600 to-violet-600',
  },
  {
    slug: 'cc20-2-3-data-architecture',
    name: '2.3 Data Architecture & Intelligent Systems',
    nameZh: '2.3 Data Architecture & Intelligent Systems',
    description: 'Databases, data lakes, industrial integration',
    descriptionEn: 'Databases, data lakes, industrial integration',
    icon: '🏗️',
    color: 'from-cyan-600 to-blue-700',
  },
  {
    slug: 'cc20-2-4-devops-iac',
    name: '2.4 DevOps & Infrastructure as Code',
    nameZh: '2.4 DevOps & Infrastructure as Code',
    description: 'CI/CD, containers, observability, IaC',
    descriptionEn: 'CI/CD, containers, observability, IaC',
    icon: '🏗️',
    color: 'from-orange-600 to-red-600',
  },
  // 03 One-Person Business
  {
    slug: 'cc20-3-1-digital-asset-matrix',
    name: '3.1 Digital Asset & Product Matrix',
    nameZh: '3.1 Digital Asset & Product Matrix',
    description: 'Product portfolio and app matrix',
    descriptionEn: 'Product portfolio and app matrix',
    icon: '💰',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    slug: 'cc20-3-2-growth-traffic',
    name: '3.2 Growth & Traffic Systems',
    nameZh: '3.2 Growth & Traffic Systems',
    description: 'GEO, SEO, content automation',
    descriptionEn: 'GEO, SEO, content automation',
    icon: '💰',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    slug: 'cc20-3-3-one-person-os',
    name: '3.3 One-Person Company Operating System',
    nameZh: '3.3 One-Person Company Operating System',
    description: 'Finance, ops automation, personal workflows',
    descriptionEn: 'Finance, ops automation, personal workflows',
    icon: '💰',
    color: 'from-lime-600 to-green-700',
  },
  {
    slug: 'cc20-3-4-personal-branding',
    name: '3.4 Personal Branding & Monetization',
    nameZh: '3.4 Personal Branding & Monetization',
    description: 'Brand and revenue as a solo operator',
    descriptionEn: 'Brand and revenue as a solo operator',
    icon: '💰',
    color: 'from-rose-500 to-orange-500',
  },
  // 04 Developer Productivity
  {
    slug: 'cc20-4-1-tools-efficiency',
    name: '4.1 Tools & Efficiency Stack',
    nameZh: '4.1 Tools & Efficiency Stack',
    description: 'Frameworks, IDEs, templates, everyday delivery',
    descriptionEn: 'Frameworks, IDEs, templates, everyday delivery',
    icon: '📦',
    color: 'from-sky-500 to-blue-600',
  },
  {
    slug: 'cc20-4-2-code-quality',
    name: '4.2 Code Quality & Best Practices',
    nameZh: '4.2 Code Quality & Best Practices',
    description: 'Security, performance, clean architecture',
    descriptionEn: 'Security, performance, clean architecture',
    icon: '📦',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    slug: 'cc20-4-3-reusable-components',
    name: '4.3 Reusable Components & Libraries',
    nameZh: '4.3 Reusable Components & Libraries',
    description: 'Shared libraries and component systems',
    descriptionEn: 'Shared libraries and component systems',
    icon: '📦',
    color: 'from-indigo-500 to-sky-600',
  },
  // 05 Insights
  {
    slug: 'cc20-5-1-industry-insights',
    name: '5.1 Industry Trends & CIO Insights',
    nameZh: '5.1 Industry Trends & CIO Insights',
    description: 'Leadership and market perspective',
    descriptionEn: 'Leadership and market perspective',
    icon: '📖',
    color: 'from-neutral-500 to-stone-600',
  },
  {
    slug: 'cc20-5-2-book-notes',
    name: '5.2 Book Notes & Mental Models',
    nameZh: '5.2 Book Notes & Mental Models',
    description: 'Reading notes and thinking tools',
    descriptionEn: 'Reading notes and thinking tools',
    icon: '📖',
    color: 'from-stone-500 to-neutral-700',
  },
  {
    slug: 'cc20-5-3-case-studies',
    name: '5.3 Case Studies & Project Retrospectives',
    nameZh: '5.3 Case Studies & Project Retrospectives',
    description: 'Real projects and vertical cases',
    descriptionEn: 'Real projects and vertical cases',
    icon: '📖',
    color: 'from-zinc-600 to-neutral-800',
  },
];

const T = {
  aiAgents: 'cc20-1-1-ai-agent-development',
  rag: 'cc20-1-2-enterprise-rag',
  localLlm: 'cc20-1-3-local-llm',
  arch: 'cc20-2-1-architecture-transformation',
  dataArch: 'cc20-2-3-data-architecture',
  devops: 'cc20-2-4-devops-iac',
  tools: 'cc20-4-1-tools-efficiency',
  quality: 'cc20-4-2-code-quality',
} as const;

/** Explicit article slug → CC20 section slug (Published KB content). */
const ARTICLE_CC20_SECTION: Record<string, string> = {
  // ─── AI / ML ───
  'ai-rag-complete-guide': T.rag,
  'ai-vector-databases': T.rag,
  'ai-fine-tuning-guide': T.localLlm,
  'ai-agents-langchain': T.aiAgents,

  // ─── Data / DB ───
  'postgresql-performance': T.dataArch,
  'database-design-patterns': T.dataArch,
  'redis-caching-strategies': T.dataArch,
  'mongodb-vs-postgresql': T.dataArch,

  // ─── DevOps ───
  'docker-compose-guide': T.devops,
  'github-actions-ci-cd': T.devops,
  'linux-essentials-devops': T.devops,
  'monitoring-observability': T.devops,

  // ─── Security / API hardening (quality lane) ───
  'web-security-essentials': T.quality,
  'jwt-authentication': T.quality,
  'api-security-guide': T.quality,
  'oauth2-guide': T.quality,

  // ─── Advanced TS / patterns (quality) ───
  'typescript-generics-advanced': T.quality,
  'typescript-migration-guide': T.quality,
  'typescript-narrowing': T.quality,
  'nodejs-best-practices': T.quality,
  'nodejs-streams': T.quality,

  // ─── Legacy KB nav slugs (previous sidebar) ───
  'rag-intro': T.rag,
  'rag-architecture': T.rag,
  'rag-indexing': T.rag,
  'rag-retrieval': T.rag,
  'rag-evaluation': T.rag,
  'rag-production': T.rag,
  'rag-pitfalls': T.rag,
  'agent-basics': T.aiAgents,
  'agent-tools': T.aiAgents,
  'agent-planning': T.aiAgents,
  'vector-db': T.rag,
  embeddings: T.rag,
  'hybrid-search': T.rag,
  microservices: T.arch,
  'api-design': T.arch,
  caching: T.arch,
  auth: T.quality,
  'data-privacy': T.quality,
  'rate-limiting': T.quality,
  monitoring: T.devops,
  'ci-cd': T.devops,
  'config-mgmt': T.devops,

  // ─── Prisma seed samples ───
  'typescript-generics-mastery': T.quality,

  // ─── Growth / SEO aligned ───
  'nextjs-seo-optimization': 'cc20-3-2-growth-traffic',
};

/** Resolve CC20 section slug for a KB article slug. */
export function getCc20SectionSlugForArticle(articleSlug: string): string {
  return ARTICLE_CC20_SECTION[articleSlug] ?? CC20_DEFAULT_SECTION_SLUG;
}
