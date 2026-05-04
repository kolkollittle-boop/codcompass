import Link from 'next/link';
import { getPublishedArticles, getArticleCount, supabaseAdmin } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import { Icon } from '@/components/ui';
import { categoryBySlug } from '@/lib/categories';
import type { Metadata } from 'next';

interface KbIndexPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Revalidate every 5 minutes to show newly crawled articles
export const revalidate = 300;

export async function generateMetadata({ params }: KbIndexPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  
  return {
    title: 'Knowledge Base - Technical Tutorials & Guides',
    description:
      'Structured knowledge base: tutorials, guides, and reference material organized by topic—not informal blog opinion pieces.',
    keywords: ['React tutorials', 'TypeScript guides', 'Next.js tutorials', 'AI/ML tutorials', 'DevOps guides', 'code examples', 'technical tutorials'],
    openGraph: {
      title: 'Knowledge Base - Technical Tutorials & Guides',
      description:
        'Structured tutorials and reference documentation—canonical knowledge for builders.',
      url: `https://www.codcompass.com/${locale}/kb`,
      siteName: 'Codcompass',
      type: 'website',
    },
  };
}

const translations = {
  en: {
    title: 'Knowledge Base',
    subtitle: 'Structured tutorials and reference knowledge—organized for learning and lookup',
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
  const itemsPerPage = 12;

  const totalArticles = await getArticleCount();

  const offset = (currentPage - 1) * itemsPerPage;
  const dbArticles = await getPublishedArticles(1000, 0, locale); // fetch all for now to get accurate count
  const paginatedArticles = dbArticles.slice(offset, offset + itemsPerPage);

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
    <div className="min-h-0 text-zinc-300">
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Learning Paths Section */}
          {seriesList.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="graduation-cap" size={20} className="text-zinc-400" />
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
                      className="docs-card group block rounded-xl p-4 transition-all hover:bg-white/[0.02]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-docs-bg text-zinc-300">
                          <Icon name="book-marked" size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-zinc-200">
                            {seriesTitle}
                          </h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
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
            <p className="mt-4 text-lg text-zinc-500">
              {t.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {articles.length > 0 ? (
              articles.map((article: any) => (
                <article
                  key={article.id}
                  className="docs-card group rounded-xl p-6 transition-all hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full border border-docs-border bg-docs-bg px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                          {article.category}
                        </span>
                        {(article.accessLevel === 'builder' || article.accessLevel === 'pro') && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              article.accessLevel === 'pro'
                                ? 'border-docs-border-hover bg-white/10 text-zinc-200'
                                : 'border-docs-border bg-docs-bg text-zinc-400'
                            }`}
                          >
                            <Icon name="lock" size={12} />
                            {article.accessLevel === 'pro' ? 'Pro' : 'Builder'}
                          </span>
                        )}
                        {article.isTrending && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-docs-border bg-docs-bg px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                            <Icon name="flame" size={12} />
                            {t.trending}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-white transition-colors group-hover:text-zinc-200">
                        <Link href={`/${locale}/kb/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-zinc-500">{article.excerpt}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                        <time>{article.date}</time>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/kb/${article.slug}`}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-docs-border bg-docs-bg text-zinc-500 transition-colors group-hover:border-docs-border-hover group-hover:text-white"
                    >
                      <Icon name="arrow-right" size={18} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-docs-surface">
                  <Icon name="book" size={32} className="text-zinc-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.noArticles}</h2>
                <p className="text-zinc-500">{t.checkBack}</p>
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
                    href={`/${locale}/kb?page=${currentPage - 1}`}
                    className="docs-card inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.03]"
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
                          <span className="px-2 text-zinc-600">...</span>
                        )}
                        <Link
                          href={`/${locale}/kb?page=${page}`}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-white text-black'
                              : 'docs-card border border-docs-border bg-docs-surface text-zinc-400 hover:bg-white/[0.03]'
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
                    href={`/${locale}/kb?page=${currentPage + 1}`}
                    className="docs-card inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.03]"
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
