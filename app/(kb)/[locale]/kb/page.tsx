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
  
  return {
    title: 'Knowledge Base - Technical Tutorials & Guides',
    description: 'Browse our comprehensive library of technical tutorials covering React, TypeScript, Next.js, AI/ML, and DevOps. Expert insights and production-ready code examples.',
    keywords: ['React tutorials', 'TypeScript guides', 'Next.js tutorials', 'AI/ML tutorials', 'DevOps guides', 'code examples', 'technical tutorials'],
    openGraph: {
      title: 'Knowledge Base - Technical Tutorials & Guides',
      description: 'Browse our comprehensive library of technical tutorials covering React, TypeScript, Next.js, AI/ML, and DevOps.',
      url: `https://www.codcompass.com/${locale}/kb`,
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
};

export default async function KbIndexPage({ params, searchParams }: KbIndexPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const t = translations.en; // Always use English translations
  
  // Fetch published series
  let seriesList: any[] = [];
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('ArticleSeries')
      .select('*')
      .eq('isPublished', true)
      .order('createdAt', { ascending: false })
      .limit(6);
    
    if (data) {
      // Get article count for each series
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
          ? catInfo.name
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
          accessLevel: a.accessLevel || (a.isPremium ? 'pro' : 'free'),
          isTrending: a.viewCount > 100,
        };
      })
    : [];

  return (
    <div className="min-h-screen bg-palette-bgPrimary text-palette-textPrimary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Learning Paths Section */}
          {seriesList.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="graduation-cap" size={20} className="text-palette-primary" />
                <h2 className="text-xl font-bold text-white">
                  Learning Paths
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {seriesList.map((series) => {
                  const seriesTitle = series.titleEn || series.title;
                  const estimatedTime = series.estimatedTime || Math.max(5, series.totalParts * 10);
                  return (
                    <Link
                      key={series.id}
                      href={`/${locale}/kb/series/${series.slug}` as any}
                      className="group block p-4 bg-palette-bgCard rounded-xl border border-palette-border hover:border-palette-primary hover:shadow-cc-theme transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-palette-bgTertiary text-palette-primary flex items-center justify-center flex-shrink-0">
                          <Icon name="book-marked" size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white group-hover:text-palette-primary transition-colors line-clamp-2">
                            {seriesTitle}
                          </h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-palette-textMuted">
                            <span>{series.articleCount} parts</span>
                            <span>·</span>
                            <span>~{estimatedTime} min</span>
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
            <p className="mt-4 text-lg text-palette-textMuted">
              {t.subtitle}
            </p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              <Link
                href={`/${locale}/kb`}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !categoryFilter
                    ? 'bg-palette-bgTertiary text-palette-primary border border-palette-primary'
                    : 'bg-palette-bgSecondary text-palette-textMuted hover:bg-palette-bgTertiary border border-palette-border'
                }`}
              >
                {t.allTopics}
              </Link>
              {CATEGORIES.map((cat) => {
                const slug = cat.slug;
                const isActive = categoryFilter === slug;
                const label = cat.name;
                return (
                  <Link
                    key={slug}
                    href={`/${locale}/kb?category=${slug}`}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-palette-bgTertiary text-palette-primary border border-palette-primary'
                        : 'bg-palette-bgSecondary text-palette-textMuted hover:bg-palette-bgTertiary border border-palette-border'
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
                  className="bg-palette-bgCard rounded-xl border border-palette-border p-6 hover:border-palette-primary hover:shadow-cc-theme transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary">
                          {article.category}
                        </span>
                        {(article.accessLevel === 'builder' || article.accessLevel === 'pro') && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            article.accessLevel === 'pro'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-palette-bgTertiary text-palette-primary border-palette-primary'
                          }`}>
                            <Icon name="lock" size={12} />
                            {article.accessLevel === 'pro' ? 'Pro' : 'Builder'}
                          </span>
                        )}
                        {article.isTrending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <Icon name="flame" size={12} />
                            {t.trending}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-white group-hover:text-palette-primary transition-colors">
                        <Link href={`/${locale}/kb/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-palette-textMuted">{article.excerpt}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-palette-textMuted">
                        <time>{article.date}</time>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/kb/${article.slug}`}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-palette-bgSecondary text-palette-textMuted group-hover:bg-palette-bgTertiary group-hover:text-palette-primary transition-colors border border-palette-border"
                    >
                      <Icon name="arrow-right" size={18} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palette-bgTertiary flex items-center justify-center">
                  <Icon name="book" size={32} className="text-palette-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.noArticles}</h2>
                <p className="text-palette-textMuted">{t.checkBack}</p>
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
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-palette-textSecondary bg-palette-bgCard border border-palette-border rounded-lg hover:bg-palette-bgSecondary transition-colors"
                  >
                    <Icon name="chevron-left" size={16} />
                    Previous
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
                          <span className="px-2 text-palette-textMuted">...</span>
                        )}
                        <Link
                          href={`/${locale}/kb?page=${page}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-palette-primary text-white'
                              : 'text-palette-textSecondary bg-palette-bgCard border border-palette-border hover:bg-palette-bgSecondary'
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
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-palette-textSecondary bg-palette-bgCard border border-palette-border rounded-lg hover:bg-palette-bgSecondary transition-colors"
                  >
                    Next
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
