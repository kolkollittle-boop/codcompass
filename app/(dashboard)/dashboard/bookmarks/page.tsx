'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([
    { id: '1', slug: 'react-hooks-deep-dive', title: 'React Hooks Deep Dive', category: 'React', date: '2026-04-20' },
    { id: '2', slug: 'typescript-generics-mastery', title: 'TypeScript Generics: From Basic to Advanced', category: 'TypeScript', date: '2026-04-18' },
    { id: '3', slug: 'nextjs-15-server-components', title: 'Next.js 15 Server Components: Complete Guide', category: 'Next.js', date: '2026-04-15' },
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palette-bgPrimary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palette-primary mx-auto"></div>
          <p className="mt-4 text-palette-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">🔖 My Bookmarks</h1>
            <p className="text-palette-textMuted mt-1">Your saved articles for later reading</p>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-palette-bgCard rounded-xl shadow-sm border border-palette-border p-6 hover:shadow-cc-theme hover:border-palette-primary transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary">
                        {bookmark.category}
                      </span>
                      <span className="text-sm text-palette-textMuted">{bookmark.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      <a href={`/kb/${bookmark.slug}`} className="hover:text-palette-primary transition-colors">
                        {bookmark.title}
                      </a>
                    </h3>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="text-palette-textMuted hover:text-red-400 transition-colors"
                    title="Remove bookmark"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {bookmarks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔖</div>
              <h3 className="text-lg font-medium text-white mb-2">No bookmarks yet</h3>
              <p className="text-palette-textMuted mb-4">Start saving articles to read later</p>
              <a
                href="/kb"
                className="inline-block px-4 py-2 bg-palette-primary text-white font-medium rounded-lg hover:bg-palette-primary-hover transition-colors"
              >
                Browse Articles
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
