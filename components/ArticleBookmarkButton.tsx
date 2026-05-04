'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bookmark } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

interface ArticleBookmarkButtonProps {
  articleId: string;
  slug: string;
  locale: string;
}

export default function ArticleBookmarkButton({ articleId, slug, locale }: ArticleBookmarkButtonProps) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setReady(false);
    try {
      const res = await authFetch(
        `/api/user/bookmarks?articleId=${encodeURIComponent(articleId)}`,
        { cache: 'no-store' }
      );
      if (res.status === 401) {
        setLoggedIn(false);
        setBookmarked(false);
      } else if (res.ok) {
        const data = await res.json();
        setLoggedIn(true);
        setBookmarked(!!data.bookmarked);
      } else {
        setLoggedIn(false);
        setBookmarked(false);
      }
    } catch {
      setLoggedIn(false);
      setBookmarked(false);
    } finally {
      setReady(true);
    }
  }, [articleId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async () => {
    setBusy(true);
    try {
      if (bookmarked) {
        const res = await authFetch(
          `/api/user/bookmarks?articleId=${encodeURIComponent(articleId)}`,
          { method: 'DELETE' }
        );
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(`/${locale}/kb/${slug}`)}`;
          return;
        }
        if (res.ok) setBookmarked(false);
      } else {
        const res = await authFetch('/api/user/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        });
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(`/${locale}/kb/${slug}`)}`;
          return;
        }
        if (res.ok) {
          setLoggedIn(true);
          setBookmarked(true);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="h-10 w-24 shrink-0 animate-pulse rounded-lg bg-white/5" aria-hidden />
    );
  }

  if (!loggedIn) {
    return (
      <a
        href={`/login?callbackUrl=${encodeURIComponent(`/${locale}/kb/${slug}`)}`}
        className="inline-flex items-center gap-2 rounded-lg border border-docs-border bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
      >
        <Bookmark className="h-4 w-4" />
        Save
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        bookmarked
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'
          : 'border-docs-border bg-white/5 text-zinc-300 hover:bg-white/10'
      }`}
      aria-pressed={bookmarked}
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
