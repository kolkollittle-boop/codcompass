'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const KB_LOCALE = 'en';

interface BookmarkRow {
  id: string;
  articleId: string;
  slug: string;
  title: string;
  createdAt: string;
}

async function authFetch(path: string, init?: RequestInit) {
  const { data: sb } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  if (sb?.session?.access_token) {
    headers.set('Authorization', `Bearer ${sb.session.access_token}`);
  }
  return fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  });
}

export default function BookmarksPage() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const router = useRouter();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setSupabaseSession(session);
        setAuthReady(true);
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!cancelled) setSupabaseSession(session);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || nextAuthStatus === 'loading') return;
    const sessionUser = supabaseSession?.user || nextAuthSession?.user;
    if (!sessionUser && nextAuthStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authReady, nextAuthStatus, supabaseSession, nextAuthSession, router]);

  useEffect(() => {
    const load = async () => {
      if (!authReady || nextAuthStatus === 'loading') return;
      const sessionUser = supabaseSession?.user || nextAuthSession?.user;
      if (!sessionUser) return;

      setLoading(true);
      setError(null);
      try {
        const res = await authFetch('/api/user/bookmarks', { cache: 'no-store' });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      } catch {
        setError('Could not load bookmarks.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authReady, nextAuthSession, supabaseSession, nextAuthStatus, router]);

  const sessionUser = supabaseSession?.user || nextAuthSession?.user;

  if (!authReady || nextAuthStatus === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center bg-docs-bg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent"></div>
          <p className="mt-4 text-docs-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!sessionUser) return null;

  const handleRemoveBookmark = async (articleId: string) => {
    const res = await authFetch(
      `/api/user/bookmarks?articleId=${encodeURIComponent(articleId)}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setBookmarks((prev) => prev.filter((b) => b.articleId !== articleId));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-docs-heading">🔖 My Bookmarks</h1>
            <p className="mt-1 text-docs-muted">Your saved articles for later reading</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-docs-accent" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🔖</div>
              <h3 className="mb-2 text-lg font-medium text-docs-heading">No bookmarks yet</h3>
              <p className="mb-4 text-docs-muted">Use Save on any article to add it here</p>
              <a
                href={`/${KB_LOCALE}/kb`}
                className="inline-block rounded-lg bg-docs-accent px-4 py-2 font-medium text-white transition-colors hover:bg-docs-accent-hover"
              >
                Browse Articles
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6 transition-all hover:border-docs-accent/50 hover:shadow-cc-theme"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-docs-muted">
                          {new Date(bookmark.createdAt).toISOString().split('T')[0]}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-docs-heading">
                        <a
                          href={`/${KB_LOCALE}/kb/${bookmark.slug}`}
                          className="transition-colors hover:text-docs-accent"
                        >
                          {bookmark.title}
                        </a>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(bookmark.articleId)}
                      className="shrink-0 text-docs-muted transition-colors hover:text-red-400"
                      title="Remove bookmark"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
