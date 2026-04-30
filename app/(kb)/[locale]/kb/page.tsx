import Link from 'next/link';
import { getPublishedArticles, getArticleCount, supabaseAdmin } from '@/lib/supabase';
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
  
  // 获取已发布的专题列表
  let seriesList: any[] = [];
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('ArticleSeries')
      .select('*')
      .eq('isPublished', true)
      .order('createdAt', { ascending: false })
      .limit(6);
    
    if (data) {
      // 获取每个专题的文章数量
      seriesList = await Promise.all(
        data.map(async (s: any) => {
          const { count } = await supabaseAdmin
            .from('Article')
            .select('*', { count: 'exact', head: true })
            .eq('seriesId', s.id)
            .eq('isPublished', true);
          return { ...s, articleCount: count ?? 0 };
        })
      );
    }
  }
  
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 专题路径展示区 */}
          {seriesList.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="graduation-cap" size={20} className="text-indigo-400" />
                <h2 className="text-xl font-bold text-white">
                  {locale === 'zh' ? '学习路径' : 'Learning Paths'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {seriesList.map((series) => {
                  const seriesTitle = locale === 'zh' && series.title ? series.title : series.titleEn;
                  const estimatedTime = series.estimatedTime || Math.max(5, series.totalParts * 10);
                  return (
                    <Link
                      key={series.id}
                      href={`/${locale}/kb/series/${series.slug}` as any}
                      className="group block p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                          <Icon name="book-marked" size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {seriesTitle}
                          </h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                            <span>{series.articleCount} {locale === 'zh' ? '篇' : 'parts'}</span>
                            <span>·</span>
                            <span>~{estimatedTime} {locale === 'zh' ? '分钟' : 'min'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
            <p className="mt-4 text-lg text-zinc-400">
              {t.subtitle}
            </p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              <Link
                href={`/${locale}/kb`}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !categoryFilter
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
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
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
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
                  className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {article.category}
                        </span>
                        {article.isPremium && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Icon name="lock" size={12} />
                            {t.premium}
                          </span>
                        )}
                        {article.isTrending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <Icon name="flame" size={12} />
                            {t.trending}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        <Link href={`/${locale}/kb/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-zinc-400">{article.excerpt}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                        <time>{article.date}</time>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/kb/${article.slug}`}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors border border-zinc-700"
                    >
                      <Icon name="arrow-right" size={18} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Icon name="book" size={32} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.noArticles}</h2>
                <p className="text-zinc-400">{t.checkBack}</p>
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
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
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
                          <span className="px-2 text-zinc-500">...</span>
                        )}
                        <Link
                          href={`/${locale}/kb?page=${page}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'text-zinc-300 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800'
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
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {locale === 'zh' ? '下一页' : 'Next'}
                    <Icon name="chevron-right" size={16} />
                  </Link>
                )}
              </nav>
            </div>
          )}
      </div>
    </div>
  );
}
