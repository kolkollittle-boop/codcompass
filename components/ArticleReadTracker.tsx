'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Records an opened article for logged-in users (NextAuth cookie and/or Supabase bearer).
 * SSR may already have recorded NextAuth users; this fills Supabase-only sessions.
 */
export default function ArticleReadTracker({ articleId }: { articleId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!articleId || sent.current) return;
    sent.current = true;

    (async () => {
      const { data: sb } = await supabase.auth.getSession();
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (sb?.session?.access_token) {
        headers.set('Authorization', `Bearer ${sb.session.access_token}`);
      }
      try {
        await fetch('/api/user/article-view', {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({ articleId }),
        });
      } catch {
        // ignore
      }
    })();
  }, [articleId]);

  return null;
}
