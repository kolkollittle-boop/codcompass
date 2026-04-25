import Link from 'next/link';
import { getPublishedArticles } from '@/lib/supabase';

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

export default async function KbIndexPage() {
  // Fetch articles from Supabase
  const dbArticles = await getPublishedArticles(20, 0);

  // Fallback static articles (if DB is empty)
  const staticArticles = [
    {
      id: 1,
      slug: 'getting-started-react-hooks',
      titleEn: 'Getting Started with React Hooks',
      excerptEn: 'Master useState, useEffect, and custom hooks. From basics to pro patterns.',
      category: 'React',
      difficulty: 'Beginner',
      date: '2026-04-15',
      readTime: '5 min',
      isPremium: true,
    },
    {
      id: 2,
      slug: 'typescript-best-practices',
      titleEn: 'TypeScript Best Practices',
      excerptEn: 'Strict mode, avoid any, interfaces vs types — everything you need to write better TS.',
      category: 'TypeScript',
      difficulty: 'Intermediate',
      date: '2026-04-12',
      readTime: '8 min',
      isPremium: true,
    },
    {
      id: 3,
      slug: 'nextjs-15-features',
      titleEn: 'Next.js 15 Features You Need to Know',
      excerptEn: 'Params as promises, caching changes, and everything breaking in the upgrade.',
      category: 'Next.js',
      difficulty: 'Intermediate',
      date: '2026-04-10',
      readTime: '10 min',
      isPremium: false,
    },
  ];

  // Use DB articles if available, otherwise fallback to static
  const articles = dbArticles.length > 0 
    ? dbArticles.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        titleEn: a.titleEn,
        excerptEn: a.excerptEn || '',
        category: a.categories?.[0]?.Category?.[0]?.name || 'General',
        difficulty: difficultyMap[a.categories?.[0]?.Category?.[0]?.name] || 'Intermediate',
        date: a.publishedAt ? new Date(a.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        readTime: `${Math.max(3, Math.ceil((a.contentEn?.length || 1000) / 2000))} min`,
        isPremium: a.isPremium,
        isTrending: a.viewCount > 100,
      }))
    : staticArticles;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-4 text-lg text-gray-600">
              Curated technical tutorials and expert insights for developers
            </p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">All Topics</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">AI/ML</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">DevOps</span>
            </div>
          </div>

          <div className="space-y-6">
            {articles.map((article: any) => (
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
                          🔒 Premium
                        </span>
                      )}
                      {article.isTrending && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔥 Trending
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      <Link href={`/kb/${article.slug}`}>
                        {article.titleEn}
                      </Link>
                    </h2>
                    <p className="mt-2 text-gray-600">{article.excerptEn}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <time>{article.date}</time>
                      <span>·</span>
                      <span>{article.readTime} read</span>
                    </div>
                  </div>
                  <Link
                    href={`/kb/${article.slug}`}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No articles yet</h2>
              <p className="text-gray-600">We're working on adding content. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
