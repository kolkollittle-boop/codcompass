import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSeriesArticles } from '@/lib/supabase';
import { getLocaleFromCookie, type Locale } from '@/lib/i18n';
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

  const title = resolvedParams.locale === 'zh' && series.title ? series.title : series.titleEn;

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
    premium: 'Premium',
    readArticle: 'Read Article',
    unlockWithPro: 'Unlock with Pro',
  },
  zh: {
    backToKB: '返回知识库',
    series: '专题',
    articles: '篇文章',
    estimatedTime: '预计时间',
    minutes: '分钟',
    startLearning: '开始学习',
    article: '篇',
    free: '免费',
    premium: '付费',
    readArticle: '阅读文章',
    unlockWithPro: 'Pro 解锁',
  },
};

export default async function SeriesPage({ params }: SeriesPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const t = translations[locale];

  const { series, articles } = await getSeriesArticles(resolvedParams.slug, locale);

  if (!series) {
    notFound();
  }

  const title = locale === 'zh' && series.title ? series.title : series.titleEn;
  const description = locale === 'zh' && series.description ? series.description : series.description;
  const estimatedTime = series.estimatedTime || Math.max(5, series.totalParts * 10);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 返回按钮 */}
        <Link
          href={`/${locale}/kb`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 mb-8 transition-colors"
        >
          <Icon name="chevron-left" size={16} />
          {t.backToKB}
        </Link>

        {/* 专题头部 */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Icon name="book-marked" size={14} />
            {t.series}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h1>
          {description && (
            <p className="text-lg text-zinc-400 mb-6 max-w-3xl">{description}</p>
          )}
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

        {/* 文章列表 */}
        <div className="space-y-4">
          {articles.map((article: any, index: number) => {
            const articleTitle = article.translations?.[0]?.title || article.titleEn;
            const articleExcerpt = article.translations?.[0]?.excerpt || article.excerptEn;
            const isPremium = article.isPremium;
            const difficulty = article.difficultyLevel || 'L2';
            const readTime = article.readingTime || Math.max(3, Math.ceil((articleTitle?.length || 100) / 200));

            return (
              <article
                key={article.id}
                className={`p-6 rounded-2xl border transition-all duration-200 ${
                  isPremium
                    ? 'bg-zinc-900/50 border-white/[0.08] hover:border-indigo-500/30'
                    : 'bg-zinc-900 border-white/[0.08] hover:border-green-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isPremium
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {isPremium ? t.premium : t.free}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-indigo-400 transition-colors">
                      {articleTitle}
                    </h3>
                    {articleExcerpt && (
                      <p className="text-sm text-zinc-500 line-clamp-2">{articleExcerpt}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={12} />
                        ~{readTime} {t.minutes}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/kb/${article.slug}`}
                    className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isPremium
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isPremium ? t.unlockWithPro : t.readArticle}
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/30">
          <h2 className="text-2xl font-bold text-white mb-3">
            {t.startLearning}
          </h2>
          <p className="text-zinc-400 mb-6">
            {locale === 'zh' ? '解锁所有文章，获取完整学习体验' : 'Unlock all articles for the complete learning experience'}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            {locale === 'zh' ? '查看定价' : 'View Pricing'}
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
