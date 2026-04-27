export interface CategoryInfo {
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'ai-llm',
    name: 'AI & LLM',
    nameZh: 'AI & LLM',
    description: 'AI 工具、LLM 技术、Prompt Engineering、RAG、Agent',
    descriptionEn: 'AI tools, LLM technology, prompt engineering, RAG, agents',
    icon: '🤖',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    slug: 'database',
    name: 'Database',
    nameZh: '数据库',
    description: 'PostgreSQL、Redis、MongoDB、Supabase、数据管理',
    descriptionEn: 'PostgreSQL, Redis, MongoDB, Supabase, and data management',
    icon: '🗄️',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'api',
    name: 'API Development',
    nameZh: 'API 开发',
    description: 'REST、GraphQL、tRPC、认证、速率限制',
    descriptionEn: 'REST, GraphQL, tRPC, authentication, rate limiting',
    icon: '🔌',
    color: 'from-green-500 to-emerald-500',
  },
  {
    slug: 'frontend',
    name: 'Frontend',
    nameZh: '前端框架',
    description: 'React、Next.js、Vue、Svelte、现代 Web 开发',
    descriptionEn: 'React, Next.js, Vue, Svelte, and modern web development',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
  },
  {
    slug: 'backend',
    name: 'Backend',
    nameZh: '后端技术',
    description: 'Node.js、Go、Rust、微服务、服务器架构',
    descriptionEn: 'Node.js, Go, Rust, microservices, and server architecture',
    icon: '⚙️',
    color: 'from-orange-500 to-amber-500',
  },
  {
    slug: 'devops',
    name: 'DevOps',
    nameZh: 'DevOps',
    description: 'Docker、Kubernetes、CI/CD、部署、基础设施',
    descriptionEn: 'Docker, Kubernetes, CI/CD, deployment, and infrastructure',
    icon: '🚀',
    color: 'from-red-500 to-orange-500',
  },
  {
    slug: 'mobile',
    name: 'Mobile Development',
    nameZh: '移动开发',
    description: 'React Native、Flutter、Swift、跨平台应用',
    descriptionEn: 'React Native, Flutter, Swift, and cross-platform apps',
    icon: '📱',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    slug: 'security',
    name: 'Security',
    nameZh: '安全',
    description: '认证、加密、渗透测试、安全编码',
    descriptionEn: 'Authentication, encryption, penetration testing, and secure coding',
    icon: '🔒',
    color: 'from-gray-600 to-gray-800',
  },
  {
    slug: 'product',
    name: 'Product & Startup',
    nameZh: '产品/创业',
    description: 'SaaS、增长、变现、独立开发、创业',
    descriptionEn: 'SaaS, growth, monetization, indie hacking, and entrepreneurship',
    icon: '💡',
    color: 'from-yellow-500 to-orange-500',
  },
];

export const categoryBySlug = (slug: string): CategoryInfo | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const allCategorySlugs = CATEGORIES.map((c) => c.slug);
