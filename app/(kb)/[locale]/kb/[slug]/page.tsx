import { notFound } from 'next/navigation';
import Link from 'next/link';
import PaywallV2 from '@/components/PaywallV2';
import HeaderMetaCard from '@/components/HeaderMetaCard';
import PathNavigator from '@/components/PathNavigator';
import ProductionBundle from '@/components/ProductionBundle';
import { getArticleBySlug, incrementViewCount, getSeriesArticles } from '@/lib/supabase';
import { getKbUserAccessLevel } from '@/lib/kb-access';
import { recordUserArticleViewIfAuthenticated } from '@/lib/article-view';
import { getArticleContent, type Locale } from '@/lib/i18n';
import ArticleBookmarkButton from '@/components/ArticleBookmarkButton';
import ArticleReadTracker from '@/components/ArticleReadTracker';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import { DocsBreadcrumbs } from '@/components/docs/DocsBreadcrumbs';
import { articleMarkdownComponents } from '@/lib/article-markdown';

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const dbArticle = await getArticleBySlug(slug, locale);
  if (!dbArticle) {
    return { title: 'Article Not Found' };
  }

  const content = getArticleContent(dbArticle, locale);
  
  return {
    title: content.seoTitle || content.title,
    description: content.seoDescription || content.excerpt,
    openGraph: {
      title: content.seoTitle || content.title,
      description: content.seoDescription || content.excerpt,
      type: 'article',
    },
  };
}

const difficultyMap: Record<string, string> = {
  L1: 'Beginner',
  L2: 'Intermediate',
  L3: 'Advanced',
  L4: 'Expert',
  'React': 'Beginner',
  'TypeScript': 'Intermediate',
  'Next.js': 'Intermediate',
  'AI/ML': 'Advanced',
  'DevOps': 'Advanced',
};

const translations = {
  en: {
    backToKB: 'Back to KB',
    builder: '🔒 Builder',
    pro: '🔒 Pro',
    unlockArticle: 'Unlock Full Article',
    subscribeText: 'Get unlimited access to all premium tutorials, code examples, and expert insights.',
    subscribeBtn: 'Subscribe from $9.99/mo',
    cancelText: 'Cancel anytime · 30-day money-back guarantee',
    sources: 'Sources',
    readTime: (minutes: number) => `${minutes} min read`,
    productionBundle: 'Production Bundle',
    bundleValue: 'Complete productivity toolkit for this article',
  },
};

// Pitfall Avoidance Checklist
const checklistData = [
  { id: '1', text: 'Sharding Taboo: Never split by fixed token count blindly; ignoring semantic boundaries leads to fragmented retrieval', icon: 'warning' as const },
  { id: '2', text: 'Weight Trap: Hybrid Search default 0.5:0.5 is often mediocre; dynamic adjustment is needed', icon: 'warning' as const },
  { id: '3', text: 'Memory Killer: Improper HNSW ef_construction settings will explode at 50GB+', icon: 'warning' as const },
  { id: '4', text: 'Re-ranking Cost Trap: Do not re-rank top-50 entirely; filter first then process top-10~20', icon: 'warning' as const },
  { id: '5', text: 'Metadata "False" Failure: Missing physical indexes on filter conditions causes query latency spikes', icon: 'info' as const },
  { id: '6', text: 'Model-Split "Gap": Chunks exceeding Embedding model context will be truncated', icon: 'info' as const },
  { id: '7', text: 'Index Update "Cliff" Jitter: Unconfigured Commit/Flush intervals cause periodic response timeouts', icon: 'shield' as const },
];

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const slug = resolvedParams.slug;
  const t = translations.en; // Always use English translations
  
  // Fetch article from Supabase
  const dbArticle = await getArticleBySlug(slug, locale);
  
  if (!dbArticle) {
    notFound();
  }

  // Get content for current locale
  const content = getArticleContent(dbArticle, locale);
  const categoryName = dbArticle.categories?.[0]?.Category?.[0]?.name || 'General';
  
  // Use new fields or fallback to old logic
  const difficulty = dbArticle.difficultyLevel || difficultyMap[categoryName] || 'L2';
  const readTime = dbArticle.readingTime || Math.max(3, Math.ceil(dbArticle.contentEn.length / 2000));
  
  // Increment view count
  await incrementViewCount(dbArticle.id);
  await recordUserArticleViewIfAuthenticated(dbArticle.id);

  // Fetch series info
  let seriesData: { id: string; slug: string; title: string; totalParts: number; estimatedTime: number | null } | null = null;
  let seriesParts: Array<{ order: number; title: string; slug: string; isPublished: boolean }> = [];
  if (dbArticle.series) {
    const result = await getSeriesArticles(dbArticle.series.slug, locale);
    if (result.series) {
      seriesData = {
        id: result.series.id,
        slug: result.series.slug,
        title: result.series.title,
        totalParts: result.series.totalParts,
        estimatedTime: result.series.estimatedTime,
      };
      seriesParts = result.articles.map((a: any) => ({
        order: a.seriesOrder || 0,
        title: a.translations?.[0]?.title || a.titleEn,
        slug: a.slug,
        isPublished: a.isPublished,
      }));
    }
  }

  // Split content into free (first 40%) and premium (remaining 60%)
  const freeContentLength = Math.floor(content.content.length * 0.4);
  const freeContent = content.content.slice(0, freeContentLength);
  const premiumContent = content.content.slice(freeContentLength);

  // Parse tags
  const tags = dbArticle.tags?.map(t => t.Tag?.[0]?.name).filter(Boolean) || [];

  const headingIds = new Set<string>();
  const mdComponents = articleMarkdownComponents(headingIds);
  const proseArticle =
    'prose prose-lg prose-invert max-w-none prose-a:no-underline prose-p:leading-relaxed prose-p:break-words prose-pre:whitespace-pre-wrap prose-pre:break-words';

  const userAccessLevel = await getKbUserAccessLevel();
  const articleAccessLevel = String(
    dbArticle.accessLevel || (dbArticle.isPremium ? 'pro' : 'free')
  ).toLowerCase();
  const hasPremiumArticleAccess =
    articleAccessLevel === 'free' ||
    (articleAccessLevel === 'builder' &&
      (userAccessLevel === 'builder' || userAccessLevel === 'pro')) ||
    (articleAccessLevel === 'pro' && userAccessLevel === 'pro');
  const showProductionBundleAsPaid =
    userAccessLevel === 'builder' || userAccessLevel === 'pro';

  return (
    <div className="min-h-0 text-zinc-400">
      <ArticleReadTracker articleId={dbArticle.id} />
      <Link
        href={`/${locale}/kb`}
        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.backToKB}
      </Link>

      <DocsBreadcrumbs
        locale={locale}
        items={[{ label: 'Knowledge Base', href: '/kb' }, { label: content.title }]}
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        <main className="min-w-0 flex-1">
          <HeaderMetaCard
              difficultyLevel={difficulty}
              readingTime={readTime}
              expectedOutcome={dbArticle.expectedOutcome}
              tags={tags}
              seriesTitle={seriesData?.title}
              seriesOrder={dbArticle.seriesOrder}
              seriesTotal={seriesData?.totalParts}
              seriesEstimatedTime={seriesData?.estimatedTime}
            />

            <header className="mb-8 border-b border-docs-border pb-6">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{content.title}</h1>
                <ArticleBookmarkButton articleId={dbArticle.id} slug={slug} locale={locale} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                <span>By {dbArticle.sourceAuthor || 'Codcompass Team'}</span>
                <span>·</span>
                <time>{dbArticle.publishedAt ? new Date(dbArticle.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</time>
                <span>·</span>
                <span>{t.readTime(readTime)}</span>
              </div>
            </header>

            <div id="docs-content" className="space-y-8">
              <div className={proseArticle}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {freeContent}
                </ReactMarkdown>
              </div>

            {hasPremiumArticleAccess ? (
              <div className={`${proseArticle} mt-8`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {premiumContent}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                <PaywallV2 variant="overlay" locale={locale} copyVersion="C" />
                <div className="relative mt-10">
                  <div className="pointer-events-none select-none opacity-30 blur-md" aria-hidden="true">
                    <div className={proseArticle}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {premiumContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>

            <ProductionBundle
              blueprintUrl={dbArticle.blueprintUrl}
              blueprintName={dbArticle.blueprintName}
              checklist={checklistData}
              isPro={showProductionBundleAsPaid}
            />

            {/* Sources */}
            {dbArticle.sourceSite && (
              <div className="mt-12 border-t border-docs-border pt-8">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{t.sources}</h3>
                <ul className="space-y-1">
                  <li className="text-sm text-zinc-500">• {dbArticle.sourceSite}</li>
                </ul>
              </div>
            )}
        </main>

          {seriesData && seriesParts.length > 0 && (
            <aside className="w-full shrink-0 lg:w-80">
              <PathNavigator
                seriesTitle={seriesData.title}
                seriesSlug={seriesData.slug}
                currentOrder={dbArticle.seriesOrder || 1}
                totalParts={seriesData.totalParts}
                estimatedTime={seriesData.estimatedTime}
                parts={seriesParts}
                locale={locale}
              />
            </aside>
          )}
      </div>
    </div>
  );
}
