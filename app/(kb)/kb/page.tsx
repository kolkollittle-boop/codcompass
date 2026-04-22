import Link from 'next/link';

export default function KbIndexPage() {
  const articles = [
    {
      id: 1,
      title: 'Getting Started with React Hooks',
      excerpt: 'Learn how to use React Hooks to simplify your functional components.',
      category: 'React',
      date: '2023-06-15',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'TypeScript Best Practices',
      excerpt: 'Essential TypeScript practices every developer should know.',
      category: 'TypeScript',
      date: '2023-07-22',
      readTime: '8 min read',
    },
    {
      id: 3,
      title: 'Next.js 15 Features Overview',
      excerpt: 'Explore the new features in Next.js 15 and how to leverage them.',
      category: 'Next.js',
      date: '2023-08-10',
      readTime: '10 min read',
    },
    {
      id: 4,
      title: 'Database Optimization Strategies',
      excerpt: 'Techniques to optimize your database queries and improve performance.',
      category: 'Database',
      date: '2023-09-05',
      readTime: '12 min read',
    },
    {
      id: 5,
      title: 'Authentication Patterns in Modern Apps',
      excerpt: 'Different authentication patterns and when to use them.',
      category: 'Security',
      date: '2023-10-12',
      readTime: '15 min read',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-4 text-lg text-gray-600">
          Curated articles and tutorials for developers and professionals
        </p>
      </div>

      <div className="space-y-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {article.category}
                </span>
                <span className="text-sm text-gray-500">{article.date}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                <Link href={`/kb/${article.id}`} className="hover:text-indigo-600">
                  {article.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{article.readTime}</span>
                <Link
                  href={`/kb/${article.id}`}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Read more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}