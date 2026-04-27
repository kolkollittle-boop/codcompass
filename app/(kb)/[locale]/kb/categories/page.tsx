import Link from 'next/link';
import { getPublishedArticles, getArticleCount, getPremiumCount } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/categories';
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
  
  // Fetch dynamic counts
  const totalCount = await getArticleCount();
  const premiumCount = await getPremiumCount();
  
  // Fetch articles for each category
  const categoryData = await Promise.all(
    CATEGORIES.map(async (category) => {
      const count = await getArticleCount(category.slug);
      const articles = await getPublishedArticles(3, 0, locale);
      const filteredArticles = articles.filter((a: any) => 
        a.categories?.some((c: any) => c.Category?.slug === category.slug)
      );
      
      return {
        ...category,
        articles: filteredArticles.slice(0, 3),
        totalArticles: count,
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
              href={`/${locale}/kb/categories/${category.slug}` as any}
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
                    <Link
                      key={article.id}
                      href={`/${locale}/kb/${article.slug}`}
                      className="flex items-center gap-2 text-sm hover:text-indigo-600 group/article"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover/article:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-gray-700 truncate">
                        {getArticleContent(article, locale).title}
                      </span>
                    </Link>
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
              <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'zh' ? '篇文章' : 'Articles'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{CATEGORIES.length}</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'zh' ? '个分类' : 'Categories'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{premiumCount}</div>
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
