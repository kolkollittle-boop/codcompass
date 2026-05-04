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
      <div className="flex flex-1 items-center justify-center bg-docs-bg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent"></div>
          <p className="mt-4 text-docs-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-docs-heading">🔖 My Bookmarks</h1>
            <p className="mt-1 text-docs-muted">Your saved articles for later reading</p>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6 transition-all hover:border-docs-accent/50 hover:shadow-cc-theme"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-docs-accent/40 bg-docs-green-subtle px-2.5 py-0.5 text-xs font-medium text-docs-accent">
                        {bookmark.category}
                      </span>
                      <span className="text-sm text-docs-muted">{bookmark.date}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-docs-heading">
                      <a href={`/kb/${bookmark.slug}`} className="transition-colors hover:text-docs-accent">
                        {bookmark.title}
                      </a>
                    </h3>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="text-docs-muted transition-colors hover:text-red-400"
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
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🔖</div>
              <h3 className="mb-2 text-lg font-medium text-docs-heading">No bookmarks yet</h3>
              <p className="mb-4 text-docs-muted">Start saving articles to read later</p>
              <a
                href="/kb"
                className="inline-block rounded-lg bg-docs-accent px-4 py-2 font-medium text-white transition-colors hover:bg-docs-accent-hover"
              >
                Browse Articles
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
