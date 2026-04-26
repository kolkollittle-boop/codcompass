import { notFound } from 'next/navigation';
import Link from 'next/link';
import Paywall from '@/components/Paywall';
import { getArticleBySlug, incrementViewCount } from '@/lib/supabase';
import { sanitizeForRender } from '@/lib/sanitize';
import { getArticleContent, type Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

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
  'React': 'Beginner',
  'TypeScript': 'Intermediate',
  'Next.js': 'Intermediate',
  'AI/ML': 'Advanced',
  'DevOps': 'Advanced',
};

function difficultyColor(d: string) {
  switch (d) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const translations = {
  en: {
    backToKB: 'Back to KB',
    premium: '🔒 Premium',
    unlockArticle: 'Unlock Full Article',
    subscribeText: 'Get unlimited access to all premium tutorials, code examples, and expert insights.',
    subscribeBtn: 'Subscribe from $9.99/mo',
    cancelText: 'Cancel anytime · 30-day money-back guarantee',
    sources: 'Sources',
    readTime: (minutes: number) => `${minutes} min read`,
  },
  zh: {
    backToKB: '返回知识库',
    premium: '🔒 付费',
    unlockArticle: '解锁全文',
    subscribeText: '获取所有付费教程、代码示例和专家见解的无限访问权限。',
    subscribeBtn: '订阅，每月 $9.99 起',
    cancelText: '随时取消 · 30 天退款保证',
    sources: '来源',
    readTime: (minutes: number) => `${minutes} 分钟阅读`,
  },
};

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
  const difficulty = difficultyMap[categoryName] || 'Intermediate';
  const readTime = Math.max(3, Math.ceil(dbArticle.contentEn.length / 2000));
  
  // Increment view count
  await incrementViewCount(dbArticle.id);

  // Split content into free (first 30%) and premium (remaining 70%)
  const freeContentLength = Math.floor(content.content.length * 0.3);
  const freeContent = content.content.slice(0, freeContentLength);
  const premiumContent = content.content.slice(freeContentLength);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${locale}/kb` as any} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7 7 7-7" />
        </svg>
        {t.backToKB}
      </Link>
      {/* Article Header */}
      <header className="mb-10 pb-8 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {categoryName}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${difficultyColor(difficulty)}`}>
                {difficulty}
              </span>
              {dbArticle.isPremium && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  {t.premium}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <div className="flex items-center text-gray-500 text-sm space-x-4">
              <span>By {dbArticle.sourceAuthor || 'Codcompass Team'}</span>
              <span>·</span>
              <time>{dbArticle.publishedAt ? new Date(dbArticle.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</time>
              <span>·</span>
              <span>{t.readTime(readTime)}</span>
            </div>
          </header>

          {/* Free Content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
              prose-a:text-indigo-600 prose-a:no-underline"
            dangerouslySetInnerHTML={sanitizeForRender(freeContent)}
          />

          {/* Premium Content */}
          {dbArticle.isPremium ? (
            <>
              {/* Inline paywall banner */}
              <Paywall variant="inline" />
              
              {/* Blurred preview */}
              <div className="relative mt-10">
                <div className="blur-md select-none pointer-events-none opacity-30" aria-hidden="true">
                  <div 
                    className="prose prose-lg max-w-none
                      prose-headings:font-bold prose-p:text-gray-700
                      prose-pre:bg-gray-900 prose-pre:text-gray-100"
                    dangerouslySetInnerHTML={sanitizeForRender(premiumContent)}
                  />
                </div>

                {/* Paywall overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-t from-white via-white/95 to-transparent w-full h-full flex items-end sm:items-center justify-center pb-8 sm:pb-0">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 max-w-md mx-4 text-center">
                      <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a22 0 002-2v-6a2 2 0 00-2-2H6a22 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t.unlockArticle}</h3>
                      <p className="text-gray-600 mb-6">
                        {t.subscribeText}
                      </p>
                      <Link
                        href={`/${locale}/pricing` as any}
                        className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                      >
                        {t.subscribeBtn}
                      </Link>
                      <p className="text-xs text-gray-500 mt-3">
                        {t.cancelText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Free article - show premium content directly */
            <div 
              className="prose prose-lg max-w-none mt-8
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
                prose-a:text-indigo-600 prose-a:no-underline"
              dangerouslySetInnerHTML={sanitizeForRender(premiumContent)}
            />
          )}

          {/* Sources */}
          {dbArticle.sourceSite && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.sources}</h3>
              <ul className="space-y-1">
                <li className="text-sm text-gray-600">• {dbArticle.sourceSite}</li>
              </ul>
            </div>
          )}
        </article>
  );
}
