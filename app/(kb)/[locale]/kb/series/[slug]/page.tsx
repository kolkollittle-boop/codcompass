import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSeriesArticles } from '@/lib/supabase';
import { type Locale } from '@/lib/i18n';
import Icon from '@/components/ui/Icon';
import type { Metadata } from 'next';

interface SeriesPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { series } = await getSeriesArticles(resolvedParams.slug, resolvedParams.locale);

  if (!series) {
    return { title: 'Series Not Found' };
  }

  const title = series.titleEn || series.title;

  return {
    title: `${title} - Series`,
    description: series.description,
  };
}

const translations = {
  en: {
    backToKB: 'Back to KB',
    series: 'Series',
    articles: 'Articles',
    estimatedTime: 'Estimated Time',
    minutes: 'min',
    startLearning: 'Start Learning',
    article: 'Article',
    free: 'Free',
    builder: 'Builder',
    pro: 'Pro',
    readArticle: 'Read Article',
    unlockWithPro: 'Unlock with Pro',
  },
};

export default async function SeriesPage({ params }: SeriesPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const t = translations.en;

  const { series, articles } = await getSeriesArticles(resolvedParams.slug, locale);

  if (!series) {
    notFound();
  }

  const title = series.titleEn || series.title;
  const description = series.description;
  const estimatedTime = series.estimatedTime || Math.max(5, series.totalParts * 10);

  return (
    <div className="min-h-0 text-zinc-400">
      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/kb`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <Icon name="chevron-left" size={16} />
          {t.backToKB}
        </Link>

        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-docs-border bg-docs-surface px-3 py-1 text-xs font-medium text-zinc-300">
            <Icon name="book-marked" size={14} />
            {t.series}
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          {description && <p className="mb-6 max-w-site text-lg text-zinc-500">{description}</p>}
          <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <Icon name="file-text" size={16} />
              {articles.length} {t.articles}
            </span>
            <span className="flex items-center gap-2">
              <Icon name="clock" size={16} />
              ~{estimatedTime} {t.minutes}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {articles.map((article: any, index: number) => {
            const articleTitle = article.translations?.[0]?.title || article.titleEn;
            const articleExcerpt = article.translations?.[0]?.excerpt || article.excerptEn;
            const accessLevel = article.accessLevel || (article.isPremium ? 'pro' : 'free');
            const difficulty = article.difficultyLevel || 'L2';
            const readTime = article.readingTime || Math.max(3, Math.ceil((articleTitle?.length || 100) / 200));

            return (
              <article
                key={article.id}
                className="docs-card rounded-2xl border border-docs-border bg-docs-surface p-6 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-docs-bg text-sm font-semibold text-zinc-300">
                        {index + 1}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          accessLevel === 'pro'
                            ? 'border-docs-border-hover bg-white/10 text-zinc-200'
                            : accessLevel === 'builder'
                              ? 'border-docs-border bg-docs-bg text-zinc-400'
                              : 'border-docs-border bg-docs-bg text-zinc-500'
                        }`}
                      >
                        {accessLevel === 'pro' ? t.pro : accessLevel === 'builder' ? t.builder : t.free}
                      </span>
                      <span className="rounded-full border border-docs-border bg-docs-bg px-2 py-0.5 text-xs font-medium text-zinc-500">
                        {difficulty}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white transition-colors hover:text-zinc-200">
                      {articleTitle}
                    </h3>
                    {articleExcerpt && (
                      <p className="line-clamp-2 text-sm text-zinc-500">{articleExcerpt}</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={12} />
                        ~{readTime} {t.minutes}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/kb/${article.slug}`}
                    className={`inline-flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      accessLevel === 'free'
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'border border-docs-border bg-docs-bg text-zinc-300 hover:border-docs-border-hover hover:text-white'
                    }`}
                  >
                    {accessLevel === 'free' ? t.readArticle : t.unlockWithPro}
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="docs-card mt-16 rounded-2xl border border-docs-border bg-docs-surface p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">{t.startLearning}</h2>
          <p className="mb-6 text-zinc-500">Unlock all articles for the complete learning experience</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            View Pricing
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
