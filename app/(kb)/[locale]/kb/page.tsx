import Link from 'next/link';
import { getPublishedArticles, getArticleCount } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import { Icon } from '@/components/ui';
import { CATEGORIES, categoryBySlug } from '@/lib/categories';
import type { Metadata } from 'next';

interface KbIndexPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

// Revalidate every 5 minutes to show newly crawled articles
export const revalidate = 300;

export async function generateMetadata({ params }: KbIndexPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  
  if (locale === 'zh') {
    return {
      title: '知识库 - 技术教程与指南',
      description: '浏览我们全面的技术教程库，涵盖 React、TypeScript、Next.js、AI/ML 和 DevOps。专家见解和生产就绪的代码示例。',
      keywords: ['React 教程', 'TypeScript 指南', 'Next.js 教程', 'AI/ML 教程', 'DevOps 指南', '代码示例', '技术教程'],
      openGraph: {
        title: '知识库 - 技术教程与指南',
        description: '浏览我们全面的技术教程库，涵盖 React、TypeScript、Next.js、AI/ML 和 DevOps。',
        url: 'https://www.codcompass.com/zh/kb',
        siteName: 'Codcompass',
        type: 'website',
      },
    };
  }
  
  return {
    title: 'Knowledge Base - Technical Tutorials & Guides',
    description: 'Browse our comprehensive library of technical tutorials covering React, TypeScript, Next.js, AI/ML, and DevOps. Expert insights and production-ready code examples.',
    keywords: ['React tutorials', 'TypeScript guides', 'Next.js tutorials', 'AI/ML tutorials', 'DevOps guides', 'code examples', 'technical tutorials'],
    openGraph: {
      title: 'Knowledge Base - Technical Tutorials & Guides',
      description: 'Browse our comprehensive library of technical tutorials covering React, TypeScript, Next.js, AI/ML, and DevOps.',
      url: 'https://www.codcompass.com/en/kb',
      siteName: 'Codcompass',
      type: 'website',
    },
  };
}

const translations = {
  en: {
    title: 'Knowledge Base',
    subtitle: 'Curated technical tutorials and expert insights for developers',
    allTopics: 'All Topics',
    premium: 'Premium',
    trending: 'Trending',
    read: 'read',
    noArticles: 'No articles yet',
    checkBack: "We're working on adding content. Check back soon!",
  },
  zh: {
    title: '知识库',
    subtitle: '为开发者精选的技术教程和专家见解',
    allTopics: '所有主题',
    premium: '付费',
    trending: '热门',
    read: '阅读',
    noArticles: '暂无文章',
    checkBack: '我们正在添加内容，请稍后再来！',
  },
};

export default async function KbIndexPage({ params, searchParams }: KbIndexPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const t = translations[locale];
  
  // Get current page from URL
  const currentPage = parseInt(resolvedSearchParams.page || '1') || 1;
  const categoryFilter = resolvedSearchParams.category;
  const itemsPerPage = 12;
  
  // Fetch total count (optionally filtered by category)
  const totalArticles = await getArticleCount(categoryFilter);
  
  // Fetch articles from Supabase with pagination
  const offset = (currentPage - 1) * itemsPerPage;
  const dbArticles = await getPublishedArticles(1000, 0, locale); // fetch all for now to get accurate count
  const filteredDbArticles = categoryFilter
    ? dbArticles.filter((a: any) => a.categories?.some((c: any) => c.Category?.slug === categoryFilter))
    : dbArticles;
  const paginatedArticles = filteredDbArticles.slice(offset, offset + itemsPerPage);

  // Map articles with locale-aware content
  const articles = paginatedArticles.length > 0 
    ? paginatedArticles.map((a: any) => {
        const content = getArticleContent(a, locale);
        const firstCat = a.categories?.[0]?.Category?.[0];
        const catSlug = firstCat?.slug || '';
        const catInfo = categoryBySlug(catSlug);
        const categoryName = catInfo 
          ? (locale === 'zh' ? catInfo.nameZh : catInfo.name) 
          : 'General';
        return {
          id: a.id,
          slug: a.slug,
          title: content.title,
          excerpt: content.excerpt,
          category: categoryName,
          categorySlug: catSlug,
          date: a.publishedAt ? new Date(a.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          readTime: `${Math.max(3, Math.ceil((a.contentEn?.length || 1000) / 2000))} ${t.read}`,
          isPremium: a.isPremium,
          isTrending: a.viewCount > 100,
        };
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="mt-4 text-lg text-gray-600">
              {t.subtitle}
            </p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              <Link
                href={`/${locale}/kb`}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !categoryFilter
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.allTopics}
              </Link>
              {CATEGORIES.map((cat) => {
                const slug = cat.slug;
                const isActive = categoryFilter === slug;
                const label = locale === 'zh' ? cat.nameZh : cat.name;
                return (
                  <Link
                    key={slug}
                    href={`/${locale}/kb?category=${slug}`}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {articles.length > 0 ? (
              articles.map((article: any) => (
                <article
                  key={article.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {article.category}
                        </span>
                        {article.isPremium && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Icon name="lock" size={12} />
                            {t.premium}
                          </span>
                        )}
                        {article.isTrending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Icon name="flame" size={12} />
                            {t.trending}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        <Link href={`/${locale}/kb/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-gray-600">{article.excerpt}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <time>{article.date}</time>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/kb/${article.slug}`}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                    >
                      <Icon name="arrow-right" size={18} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Icon name="book" size={32} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.noArticles}</h2>
                <p className="text-gray-600">{t.checkBack}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {articles.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center gap-2">
                {/* Previous button */}
                {currentPage > 1 && (
                  <Link
                    href={`/${locale}/kb?page=${currentPage - 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon name="chevron-left" size={16} />
                    {locale === 'zh' ? '上一页' : 'Previous'}
                  </Link>
                )}

                {/* Page numbers */}
                {Array.from({ length: Math.ceil(totalArticles / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    // Show current page, first page, last page, and pages around current
                    return page === 1 || page === Math.ceil(totalArticles / itemsPerPage) || Math.abs(page - currentPage) <= 2;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Link
                          href={`/${locale}/kb?page=${page}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </Link>
                      </div>
                    );
                  })}

                {/* Next button */}
                {currentPage < Math.ceil(totalArticles / itemsPerPage) && (
                  <Link
                    href={`/${locale}/kb?page=${currentPage + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {locale === 'zh' ? '下一页' : 'Next'}
                    <Icon name="chevron-right" size={16} />
                  </Link>
                )}
              </nav>
            </div>
          )}
    </div>
  );
}
