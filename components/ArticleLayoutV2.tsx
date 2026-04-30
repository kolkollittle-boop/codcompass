import React from 'react';
import HeaderMetaCard from '@/components/HeaderMetaCard';
import PathNavigator from '@/components/PathNavigator';
import ProductionBundle from '@/components/ProductionBundle';
import PaywallV2 from '@/components/PaywallV2';

interface ArticleLayoutV2Props {
  children: React.ReactNode;
  // Header Meta
  difficultyLevel?: string | null;
  readingTime?: number | null;
  expectedOutcome?: string | null;
  tags?: string[];
  // Series
  series?: {
    id: string;
    slug: string;
    title: string;
    totalParts: number;
    estimatedTime: number | null;
  } | null;
  seriesOrder?: number | null;
  seriesParts?: Array<{
    order: number;
    title: string;
    slug: string;
    isPublished: boolean;
    isCompleted?: boolean;
  }>;
  // Blueprint
  blueprintUrl?: string | null;
  blueprintName?: string | null;
  // Checklist
  checklist?: Array<{ id: string; text: string; icon?: 'warning' | 'info' | 'shield' }>;
  // Paywall
  isPremium?: boolean;
  isUserPro?: boolean;
  freeContent: React.ReactNode;
  premiumContent: React.ReactNode;
  paywallPosition?: number; // 0-100 百分比，默认 40
  locale?: string;
}

export default function ArticleLayoutV2({
  children,
  difficultyLevel,
  readingTime,
  expectedOutcome,
  tags = [],
  series,
  seriesOrder,
  seriesParts,
  blueprintUrl,
  blueprintName,
  checklist = [],
  isPremium = false,
  isUserPro = false,
  freeContent,
  premiumContent,
  paywallPosition = 40,
  locale = 'en',
}: ArticleLayoutV2Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {/* Header Meta Card */}
            <HeaderMetaCard
              difficultyLevel={difficultyLevel}
              readingTime={readingTime}
              expectedOutcome={expectedOutcome}
              tags={tags}
              seriesTitle={series?.title}
              seriesOrder={seriesOrder}
              seriesTotal={series?.totalParts}
              seriesEstimatedTime={series?.estimatedTime}
            />

            {/* 文章正文 */}
            <article className="prose prose-lg prose-invert max-w-none">
              {freeContent}
            </article>

            {/* 付费墙 */}
            {isPremium && !isUserPro && (
              <PaywallV2 variant="overlay" locale={locale} copyVersion="C" />
            )}

            {/* Pro 用户或免费文章显示剩余内容 */}
            {(!isPremium || isUserPro) && (
              <article className="prose prose-lg prose-invert max-w-none mt-8">
                {premiumContent}
              </article>
            )}

            {/* Production Bundle */}
            {(blueprintUrl || checklist.length > 0) && (
              <ProductionBundle
                blueprintUrl={blueprintUrl}
                blueprintName={blueprintName}
                checklist={checklist}
                isPro={isUserPro}
              />
            )}
          </main>

          {/* 侧边栏 - Path Navigator */}
          {series && seriesParts && seriesParts.length > 0 && (
            <aside className="lg:w-80 flex-shrink-0">
              <PathNavigator
                seriesTitle={series.title}
                seriesSlug={series.slug}
                currentOrder={seriesOrder || 1}
                totalParts={series.totalParts}
                estimatedTime={series.estimatedTime}
                parts={seriesParts}
                locale={locale}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
