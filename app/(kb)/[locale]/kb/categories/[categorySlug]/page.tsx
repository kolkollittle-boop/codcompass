import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticlesByCategorySlug } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface CategorySlugPageProps {
  params: {
    locale: Locale;
    categorySlug: string;
  };
}

export async function generateMetadata({ params }: CategorySlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const slug = resolvedParams.categorySlug;
  
  return {
    title: `${slug} - Codcompass`,
    description: `Articles in the ${slug} category.`,
  };
}

const categoryMap: Record<string, { name: string; nameZh: string; icon: string; color: string }> = {
  'ai-llm': { name: 'AI & LLM', nameZh: 'AI & LLM', icon: '🤖', color: 'from-purple-500 to-indigo-500' },
  'database': { name: 'Database', nameZh: '数据库', icon: '🗄️', color: 'from-blue-500 to-cyan-500' },
  'api': { name: 'API Development', nameZh: 'API 开发', icon: '🔌', color: 'from-green-500 to-emerald-500' },
  'frontend': { name: 'Frontend', nameZh: '前端框架', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  'backend': { name: 'Backend', nameZh: '后端技术', icon: '⚙️', color: 'from-orange-500 to-amber-500' },
  'devops': { name: 'DevOps', nameZh: 'DevOps', icon: '🚀', color: 'from-red-500 to-orange-500' },
  'mobile': { name: 'Mobile Development', nameZh: '移动开发', icon: '📱', color: 'from-teal-500 to-cyan-500' },
  'security': { name: 'Security', nameZh: '安全', icon: '🔒', color: 'from-gray-600 to-gray-800' },
  'product': { name: 'Product & Startup', nameZh: '产品/创业', icon: '💡', color: 'from-yellow-500 to-orange-500' },
};

const translations = {
  en: {
    allCategories: 'All Categories',
    articlesIn: 'Articles in',
  },
  zh: {
    allCategories: '所有分类',
    articlesIn: '分类：',
  },
};

export default async function CategorySlugPage({ params }: CategorySlugPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const slug = resolvedParams.categorySlug;
  const t = translations[locale];
  
  const catInfo = categoryMap[slug];
  if (!catInfo) notFound();

  const articles = await getArticlesByCategorySlug(slug, 100, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${catInfo.color} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/kb/categories`} className="text-white/80 hover:text-white mb-4 inline-block">
            ← {t.allCategories}
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span>{catInfo.icon}</span>
            {locale === 'zh' ? catInfo.nameZh : catInfo.name}
          </h1>
          <p className="mt-4 text-xl text-white/80">
            {t.articlesIn} {locale === 'zh' ? catInfo.nameZh : catInfo.name}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No articles in this category yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((article: any) => {
              const content = getArticleContent(article, locale);
              return (
                <Link
                  key={article.id}
                  href={`/${locale}/kb/${article.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 mb-2">
                        {content.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {content.excerpt || content.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          👁️ {article.viewCount}
                        </span>
                        {article.isPremium && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}