import { notFound } from 'next/navigation';
import Link from 'next/link';
import Paywall from '@/components/Paywall';
import PaywallV2 from '@/components/PaywallV2';
import HeaderMetaCard from '@/components/HeaderMetaCard';
import PathNavigator from '@/components/PathNavigator';
import ProductionBundle from '@/components/ProductionBundle';
import { getArticleBySlug, incrementViewCount, getSeriesArticles } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';

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

function difficultyColor(d: string) {
  switch (d) {
    case 'Beginner':
    case 'L1': return 'bg-green-100 text-green-800';
    case 'Intermediate':
    case 'L2': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced':
    case 'L3': return 'bg-orange-100 text-orange-800';
    case 'Expert':
    case 'L4': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const translations = {
  en: {
    backToKB: 'Back to KB',
    premium: '🔒 Premium',
    unlockArticle: 'Unlock Full Article',
    subscribeText: 'Get unlimited access to all premium tutorials, code examples, and expert insights.',
    subscribeBtn: 'Subscribe from $15/mo',
    cancelText: 'Cancel anytime · 30-day money-back guarantee',
    sources: 'Sources',
    readTime: (minutes: number) => `${minutes} min read`,
    productionBundle: 'Production Bundle',
    bundleValue: 'Complete productivity toolkit for this article',
  },
  zh: {
    backToKB: '返回知识库',
    premium: '🔒 付费',
    unlockArticle: '解锁全文',
    subscribeText: '获取所有付费教程、代码示例和专家见解的无限访问权限。',
    subscribeBtn: '订阅，每月 $15 起',
    cancelText: '随时取消 · 30 天退款保证',
    sources: '来源',
    readTime: (minutes: number) => `${minutes} 分钟阅读`,
    productionBundle: '生产力工具包',
    bundleValue: '本篇完整生产力工具包',
  },
};

// 避坑 Checklist 数据
const checklistData = [
  { id: '1', text: '分片禁忌：别盲目按固定 token 切分，忽略语义边界会导致碎片化检索', icon: 'warning' as const },
  { id: '2', text: '权重陷阱：Hybrid Search 默认 0.5:0.5 往往平庸，需动态调整', icon: 'warning' as const },
  { id: '3', text: '内存杀手：HNSW ef_construction 设置不当会在 50GB+ 时爆炸', icon: 'warning' as const },
  { id: '4', text: 'Re-ranking 成本陷阱：不要对 top-50 全量 rerank，建议先过滤再对 top-10~20 处理', icon: 'warning' as const },
  { id: '5', text: '元数据"假性"失效：过滤条件未建物理索引会导致查询延迟飙升', icon: 'info' as const },
  { id: '6', text: '模型与切分的"断层"：切分块超出 Embedding 模型上下文会被截断', icon: 'info' as const },
  { id: '7', text: '索引更新的"断崖式"抖动：未配置合理 Commit/Flush 间隔会导致周期性响应超时', icon: 'shield' as const },
];

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const slug = resolvedParams.slug;
  const t = translations[locale];
  
  // Fetch article from Supabase
  const dbArticle = await getArticleBySlug(slug, locale);
  
  if (!dbArticle) {
    notFound();
  }

  // Get content for current locale
  const content = getArticleContent(dbArticle, locale);
  const categoryName = dbArticle.categories?.[0]?.Category?.[0]?.name || 'General';
  
  // 使用新字段或回退到旧逻辑
  const difficulty = dbArticle.difficultyLevel || difficultyMap[categoryName] || 'L2';
  const readTime = dbArticle.readingTime || Math.max(3, Math.ceil(dbArticle.contentEn.length / 2000));
  
  // Increment view count
  await incrementViewCount(dbArticle.id);

  // 获取专题信息
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

  // 解析标签
  const tags = dbArticle.tags?.map(t => t.Tag?.[0]?.name).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link href={`/${locale}/kb`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.backToKB}
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {/* Header Meta Card */}
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

            {/* Article Header */}
            <header className="mb-8 pb-6 border-b border-zinc-800">
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">{content.title}</h1>
              <div className="flex items-center text-zinc-500 text-sm space-x-4">
                <span>By {dbArticle.sourceAuthor || 'Codcompass Team'}</span>
                <span>·</span>
                <time>{dbArticle.publishedAt ? new Date(dbArticle.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</time>
                <span>·</span>
                <span>{t.readTime(readTime)}</span>
              </div>
            </header>

            {/* Free Content */}
            <div
              className="prose prose-lg prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-zinc-100
                prose-p:text-zinc-300 prose-p:leading-relaxed
                prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-lg
                prose-a:text-cyan-400 prose-a:no-underline"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{freeContent}</ReactMarkdown>
            </div>

            {/* Premium Content */}
            {dbArticle.isPremium ? (
              <>
                {/* Paywall V2 */}
                <PaywallV2 variant="overlay" locale={locale} copyVersion="C" />
                
                {/* Blurred preview */}
                <div className="relative mt-10">
                  <div className="blur-md select-none pointer-events-none opacity-30" aria-hidden="true">
                    <div
                      className="prose prose-lg prose-invert max-w-none
                        prose-headings:font-bold prose-p:text-zinc-300
                        prose-pre:bg-zinc-900 prose-pre:text-zinc-100"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{premiumContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Free article - show premium content directly */
              <div
                className="prose prose-lg prose-invert max-w-none mt-8
                  prose-headings:font-bold prose-headings:text-zinc-100
                  prose-p:text-zinc-300 prose-p:leading-relaxed
                  prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-lg
                  prose-a:text-cyan-400 prose-a:no-underline"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{premiumContent}</ReactMarkdown>
              </div>
            )}

            {/* Production Bundle */}
            <ProductionBundle
              blueprintUrl={dbArticle.blueprintUrl}
              blueprintName={dbArticle.blueprintName}
              checklist={checklistData}
              isPro={false}
            />

            {/* Sources */}
            {dbArticle.sourceSite && (
              <div className="mt-12 pt-8 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">{t.sources}</h3>
                <ul className="space-y-1">
                  <li className="text-sm text-zinc-400">• {dbArticle.sourceSite}</li>
                </ul>
              </div>
            )}
          </main>

          {/* 侧边栏 - Path Navigator */}
          {seriesData && seriesParts.length > 0 && (
            <aside className="lg:w-80 flex-shrink-0">
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
    </div>
  );
}
