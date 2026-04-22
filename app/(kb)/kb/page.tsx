import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const articles = [
  {
    id: 1,
    slug: 'getting-started-react-hooks',
    title: 'Getting Started with React Hooks',
    excerpt: 'Master useState, useEffect, and custom hooks. From basics to pro patterns.',
    category: 'React',
    difficulty: 'Beginner',
    date: '2026-04-15',
    readTime: '5 min',
    isPremium: true,
  },
  {
    id: 2,
    slug: 'typescript-best-practices',
    title: 'TypeScript Best Practices',
    excerpt: 'Strict mode, avoid any, interfaces vs types — everything you need to write better TS.',
    category: 'TypeScript',
    difficulty: 'Intermediate',
    date: '2026-04-12',
    readTime: '8 min',
    isPremium: true,
  },
  {
    id: 3,
    slug: 'nextjs-15-features',
    title: 'Next.js 15 Features You Need to Know',
    excerpt: 'Params as promises, caching changes, and everything breaking in the upgrade.',
    category: 'Next.js',
    difficulty: 'Intermediate',
    date: '2026-04-10',
    readTime: '10 min',
    isPremium: false,
  },
  {
    id: 4,
    slug: 'pytorch-vs-jax',
    title: 'PyTorch vs JAX in 2026: A Practical Comparison',
    excerpt: 'Real benchmarks, real projects. Which framework should you choose for your next AI project?',
    category: 'AI/ML',
    difficulty: 'Advanced',
    date: '2026-04-08',
    readTime: '12 min',
    isPremium: true,
  },
  {
    id: 5,
    slug: 'rust-async-patterns',
    title: 'Rust Async Patterns That Actually Work',
    excerpt: 'Tokio runtime, async traits, and error handling patterns from real production code.',
    category: 'Rust',
    difficulty: 'Advanced',
    date: '2026-04-05',
    readTime: '15 min',
    isPremium: true,
  },
  {
    id: 6,
    slug: 'docker-compose-best-practices',
    title: 'Docker Compose Best Practices for Development',
    excerpt: 'Multi-stage builds, health checks, volumes, and networking. Your dev environment, perfected.',
    category: 'DevOps',
    difficulty: 'Intermediate',
    date: '2026-04-02',
    readTime: '10 min',
    isPremium: false,
  },
];

const difficultyColor = (d: string) => {
  switch (d) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function KbIndexPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-4 text-lg text-gray-600">
              Curated technical tutorials and expert insights for developers
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">All Topics</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">AI/ML</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">DevOps</span>
            </div>
          </div>

          <div className="space-y-6">
            {articles.map((article) => (
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
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      <Link href={`/kb/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-gray-600">{article.excerpt}</p>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
