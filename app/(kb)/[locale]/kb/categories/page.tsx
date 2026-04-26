import Link from 'next/link';
import { getPublishedArticles } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    locale: Locale;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  
  if (locale === 'zh') {
    return {
      title: '文章分类 - Codcompass',
      description: '浏览所有技术分类：AI & LLM、数据库、API 开发、前端、后端、DevOps、移动开发、安全、产品创业。',
    };
  }
  
  return {
    title: 'Categories - Codcompass',
    description: 'Browse all technical categories: AI & LLM, Database, API Development, Frontend, Backend, DevOps, Mobile Development, Security, Product & Startup.',
  };
}

const categories = [
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

const translations = {
  en: {
    title: 'Browse by Category',
    subtitle: 'Explore our comprehensive library of technical tutorials organized by topic',
    articles: 'articles',
    viewAll: 'View All Articles',
    popularArticles: 'Popular Articles',
  },
  zh: {
    title: '按分类浏览',
    subtitle: '探索我们按主题组织的全面技术教程库',
    articles: '篇文章',
    viewAll: '查看全部文章',
    popularArticles: '热门文章',
  },
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = translations[locale];
  
  // Fetch articles for each category
  const categoryData = await Promise.all(
    categories.map(async (category) => {
      const articles = await getPublishedArticles(100, 0, locale);
      const filteredArticles = articles.filter((a: any) => 
        a.categories?.some((c: any) => c.Category?.[0]?.slug === category.slug)
      );
      
      return {
        ...category,
        articles: filteredArticles.slice(0, 3),
        totalArticles: filteredArticles.length,
      };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/kb?category=${category.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <span className="text-sm text-gray-500">
                  {category.totalArticles} {t.articles}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {locale === 'zh' ? category.nameZh : category.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {locale === 'zh' ? category.description : category.descriptionEn}
              </p>
              
              {category.articles.length > 0 && (
                <div className="space-y-2">
                  {category.articles.map((article: any) => (
                    <div
                      key={article.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-gray-700 truncate">
                        {getArticleContent(article, locale).title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-indigo-600 font-medium group-hover:text-indigo-700">
                  {t.viewAll} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">117</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'zh' ? '篇文章' : 'Articles'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">9</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'zh' ? '个分类' : 'Categories'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">37</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'zh' ? '篇付费' : 'Premium'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">2</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'zh' ? '种语言' : 'Languages'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
