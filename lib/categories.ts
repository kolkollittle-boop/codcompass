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
    description: 'AI tools, LLM technology, prompt engineering, RAG, agents',
    descriptionEn: 'AI tools, LLM technology, prompt engineering, RAG, agents',
    icon: '🤖',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    slug: 'database',
    name: 'Database',
    nameZh: 'Database',
    description: 'PostgreSQL, Redis, MongoDB, Supabase, and data management',
    descriptionEn: 'PostgreSQL, Redis, MongoDB, Supabase, and data management',
    icon: '🗄️',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'api',
    name: 'API Development',
    nameZh: 'API development',
    description: 'REST, GraphQL, tRPC, authentication, rate limiting',
    descriptionEn: 'REST, GraphQL, tRPC, authentication, rate limiting',
    icon: '🔌',
    color: 'from-green-500 to-emerald-500',
  },
  {
    slug: 'frontend',
    name: 'Frontend',
    nameZh: 'Frontend',
    description: 'React, Next.js, Vue, Svelte, and modern web development',
    descriptionEn: 'React, Next.js, Vue, Svelte, and modern web development',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
  },
  {
    slug: 'backend',
    name: 'Backend',
    nameZh: 'Backend',
    description: 'Node.js, Go, Rust, microservices, and server architecture',
    descriptionEn: 'Node.js, Go, Rust, microservices, and server architecture',
    icon: '⚙️',
    color: 'from-orange-500 to-amber-500',
  },
  {
    slug: 'devops',
    name: 'DevOps',
    nameZh: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD, deployment, and infrastructure',
    descriptionEn: 'Docker, Kubernetes, CI/CD, deployment, and infrastructure',
    icon: '🚀',
    color: 'from-red-500 to-orange-500',
  },
  {
    slug: 'mobile',
    name: 'Mobile Development',
    nameZh: 'Mobile',
    description: 'React Native, Flutter, Swift, and cross-platform apps',
    descriptionEn: 'React Native, Flutter, Swift, and cross-platform apps',
    icon: '📱',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    slug: 'security',
    name: 'Security',
    nameZh: 'Security',
    description: 'Authentication, encryption, penetration testing, and secure coding',
    descriptionEn: 'Authentication, encryption, penetration testing, and secure coding',
    icon: '🔒',
    color: 'from-gray-600 to-gray-800',
  },
  {
    slug: 'product',
    name: 'Product & Startup',
    nameZh: 'Product & startup',
    description: 'SaaS, growth, monetization, indie hacking, and entrepreneurship',
    descriptionEn: 'SaaS, growth, monetization, indie hacking, and entrepreneurship',
    icon: '💡',
    color: 'from-yellow-500 to-orange-500',
  },
];

export const categoryBySlug = (slug: string): CategoryInfo | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const allCategorySlugs = CATEGORIES.map((c) => c.slug);
