/**
 * Codcompass 2.0 Knowledge Base — static navigation tree (recursive sidebar).
 * `href` is app path without locale prefix.
 *
 * Recommended dynamic tags on articles (metadata / filters):
 * - Difficulty: Beginner | Intermediate | Advanced
 * - Status: In Progress | Completed | Needs Update
 * - Type: Practical Guide | Case Study | Framework | Checklist | Notes
 * - Related: Cyber-Sage | F9 Upgrade | Textile ERP | Personal Project
 */
export type KbNavNode = {
  label: string;
  href?: `/${string}`;
  children?: KbNavNode[];
  defaultOpen?: boolean;
  isNew?: boolean;
};

export function getKbNavTree(): KbNavNode[] {
  return [
    {
      label: '01 🤖 AI Agents & Automation (Core Growth Engine)',
      defaultOpen: true,
      children: [
        {
          label: '1.1 AI Agent Development & Orchestration',
          children: [
            { label: 'OpenClaw Practical Guide', href: '/kb/openclaw-practical-guide' },
            { label: 'Claude Code & Roo Code Setup', href: '/kb/claude-code-roo-code-setup' },
            {
              label: 'Multi-Agent Collaboration & Orchestration',
              href: '/kb/multi-agent-collaboration-orchestration',
            },
            {
              label: 'Agent Evaluation & Testing Frameworks',
              href: '/kb/agent-evaluation-testing-frameworks',
            },
          ],
        },
        {
          label: '1.2 Enterprise RAG & Knowledge Engines',
          children: [
            {
              label: 'Enterprise-grade RAG System Building',
              href: '/kb/enterprise-rag-system-building',
            },
            {
              label: 'Code Automation & Generation Pipelines',
              href: '/kb/code-automation-generation-pipelines',
            },
            {
              label: 'AI-Powered Decision Support Systems',
              href: '/kb/ai-powered-decision-support-systems',
            },
          ],
        },
        {
          label: '1.3 Local LLM Deployment & Optimization',
          children: [
            {
              label: 'Apple Silicon (M1/M2/M3/M4) Optimization',
              href: '/kb/apple-silicon-llm-optimization',
            },
            {
              label: 'Private LLM Fine-tuning & Quantization',
              href: '/kb/private-llm-finetuning-quantization',
            },
            {
              label: 'Cost & Performance Optimization',
              href: '/kb/llm-cost-performance-optimization',
            },
          ],
        },
        {
          label: '1.4 AI Productization & Commercialization',
          href: '/kb/ai-productization-commercialization',
        },
      ],
    },
    {
      label: '02 🏗️ Enterprise Architecture & Modernization (Technical Moat)',
      children: [
        {
          label: '2.1 Architecture Transformation',
          children: [
            { label: 'Legacy System Modernization', href: '/kb/legacy-system-modernization' },
            { label: 'C/S to B/S Migration Strategies', href: '/kb/cs-to-bs-migration-strategies' },
            {
              label: 'Microservices & Cloud-Native Transition',
              href: '/kb/microservices-cloud-native-transition',
            },
          ],
        },
        {
          label: '2.2 .NET / C# Advanced Development',
          children: [
            {
              label: 'High-Performance Web Frameworks',
              href: '/kb/dotnet-high-performance-web-frameworks',
            },
            {
              label: 'Advanced .NET Patterns & Practices',
              href: '/kb/dotnet-advanced-patterns-practices',
            },
          ],
        },
        {
          label: '2.3 Data Architecture & Intelligent Systems',
          children: [
            {
              label: 'Database Design & Data Lake Architecture',
              href: '/kb/database-design-data-lake-architecture',
            },
            {
              label: 'Industrial Internet & MES Integration',
              href: '/kb/industrial-internet-mes-integration',
            },
          ],
        },
        {
          label: '2.4 DevOps & Infrastructure as Code',
          href: '/kb/devops-infrastructure-as-code',
        },
      ],
    },
    {
      label: '03 💰 One-Person Business & Digital Operations (Business Operating System)',
      children: [
        {
          label: '3.1 Digital Asset & Product Matrix',
          children: [
            { label: 'App Matrix Management', href: '/kb/app-matrix-management' },
            {
              label: 'From Code to Subscription Products',
              href: '/kb/code-to-subscription-products',
            },
          ],
        },
        {
          label: '3.2 Growth & Traffic Systems',
          children: [
            {
              label: 'GEO (Generative Engine Optimization)',
              href: '/kb/geo-generative-engine-optimization',
            },
            {
              label: 'SEO & Content Marketing Automation',
              href: '/kb/seo-content-marketing-automation',
            },
          ],
        },
        {
          label: '3.3 One-Person Company Operating System',
          children: [
            {
              label: 'Automated Finance & Operations',
              href: '/kb/automated-finance-operations',
            },
            {
              label: 'Personal Productivity & Workflow Systems',
              href: '/kb/personal-productivity-workflow-systems',
            },
          ],
        },
        {
          label: '3.4 Personal Branding & Monetization',
          href: '/kb/personal-branding-monetization',
        },
      ],
    },
    {
      label: '04 📦 Developer Productivity & Resources (Foundation Layer)',
      children: [
        {
          label: '4.1 Tools & Efficiency Stack',
          children: [
            {
              label: 'IDEs, Extensions & Setup Guides',
              href: '/kb/ides-extensions-setup-guides',
            },
            {
              label: 'Scaffolding Templates & Boilerplates',
              href: '/kb/scaffolding-templates-boilerplates',
            },
          ],
        },
        {
          label: '4.2 Code Quality & Best Practices',
          children: [
            {
              label: 'Security Development Standards',
              href: '/kb/security-development-standards',
            },
            {
              label: 'Performance Optimization Checklist',
              href: '/kb/performance-optimization-checklist',
            },
            {
              label: 'Clean Code & Architecture Patterns',
              href: '/kb/clean-code-architecture-patterns',
            },
          ],
        },
        {
          label: '4.3 Reusable Components & Libraries',
          href: '/kb/reusable-components-libraries',
        },
      ],
    },
    {
      label: '05 📖 Insights · Methodology · Review (Knowledge Capital)',
      children: [
        {
          label: '5.1 Industry Trends & CIO Insights',
          href: '/kb/industry-trends-cio-insights',
        },
        {
          label: '5.2 Book Notes & Mental Models',
          href: '/kb/book-notes-mental-models',
        },
        {
          label: '5.3 Case Studies & Project Retrospectives',
          children: [
            {
              label: 'Vertical Industry Cases (Textile/Supply Chain, etc.)',
              href: '/kb/vertical-industry-case-studies',
            },
          ],
        },
      ],
    },
  ];
}

export function collectNavHrefs(nodes: KbNavNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.href) out.push(n.href);
    if (n.children?.length) out.push(...collectNavHrefs(n.children));
  }
  return out;
}
