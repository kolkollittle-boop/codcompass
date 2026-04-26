import Link from 'next/link';
import { getPublishedArticles } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface KbIndexPageProps {
  params: Promise<{
    locale: string;
  }>;
}

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

const difficultyMap: Record<string, string> = {
  'React': 'Beginner',
  'TypeScript': 'Intermediate',
  'Next.js': 'Intermediate',
  'AI/ML': 'Advanced',
  'DevOps': 'Advanced',
};

const difficultyColor = (d: string) => {
  switch (d) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const translations = {
  en: {
    title: 'Knowledge Base',
    subtitle: 'Curated technical tutorials and expert insights for developers',
    allTopics: 'All Topics',
    premium: '🔒 Premium',
    trending: '🔥 Trending',
    read: 'read',
    noArticles: 'No articles yet',
    checkBack: "We're working on adding content. Check back soon!",
  },
  zh: {
    title: '知识库',
    subtitle: '为开发者精选的技术教程和专家见解',
    allTopics: '所有主题',
    premium: '🔒 付费',
    trending: '🔥 热门',
    read: '阅读',
    noArticles: '暂无文章',
    checkBack: '我们正在添加内容，请稍后再来！',
  },
};

export default async function KbIndexPage({ params }: KbIndexPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) || 'en';
  const t = translations[locale];
  
  // Fetch articles from Supabase
  const dbArticles = await getPublishedArticles(20, 0, locale);

  // Map articles with locale-aware content
  const articles = dbArticles.length > 0 
    ? dbArticles.map((a: any) => {
        const content = getArticleContent(a, locale);
        const categoryName = a.categories?.[0]?.Category?.[0]?.name || 'General';
        return {
          id: a.id,
          slug: a.slug,
          title: content.title,
          excerpt: content.excerpt,
          category: categoryName,
          difficulty: difficultyMap[categoryName] || 'Intermediate',
          date: a.publishedAt ? new Date(a.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          readTime: `${Math.max(3, Math.ceil((a.contentEn?.length || 1000) / 2000))} ${t.read}`,
          isPremium: a.isPremium,
          isTrending: a.viewCount > 100,
        };
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="mt-4 text-lg text-gray-600">
              {t.subtitle}
            </p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{t.allTopics}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">AI/ML</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">DevOps</span>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                        {article.isPremium && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {t.premium}
                          </span>
                        )}
                        {article.isTrending && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t.trending}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        <Link href={(`/kb/${article.slug}`) as any}>
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
                      href={(`/kb/${article.slug}`) as any}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.noArticles}</h2>
                <p className="text-gray-600">{t.checkBack}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
