'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  slug: string;
  titleEn: string;
  excerptEn: string | null;
}

export function DocsSearchPalette({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(Array.isArray(json.results) ? json.results : []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close search" onClick={onClose} />
      <div
        className="docs-card relative z-10 w-full max-w-lg rounded-lg bg-docs-surface p-3 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-md border border-docs-border bg-docs-bg py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none ring-0 focus:border-docs-border-hover"
          />
        </div>
        <div className="mt-2 max-h-[50vh] overflow-y-auto rounded-md border border-docs-border bg-docs-bg">
          {loading ? (
            <div className="p-4 text-center text-sm text-zinc-500">Searching…</div>
          ) : query.length >= 2 && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">No results for &ldquo;{query}&rdquo;</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/${locale}/kb/${r.slug}`}
                    className="block px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                    onClick={() => {
                      onClose();
                      setQuery('');
                    }}
                  >
                    <span className="block text-sm font-medium text-white">{r.titleEn}</span>
                    {r.excerptEn ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-zinc-500">{r.excerptEn}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-600">Type at least 2 characters</div>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          <kbd className="rounded border border-docs-border bg-docs-bg px-1.5 py-0.5 font-mono text-zinc-400">Esc</kbd>
          {' · '}
          <kbd className="rounded border border-docs-border bg-docs-bg px-1.5 py-0.5 font-mono text-zinc-400">⌘</kbd>
          <kbd className="ml-0.5 rounded border border-docs-border bg-docs-bg px-1.5 py-0.5 font-mono text-zinc-400">K</kbd>
        </p>
      </div>
    </div>
  );
}

export function DocsSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'docs-card flex w-full items-center justify-center gap-2 rounded-md bg-docs-bg px-3 py-2 text-left text-sm text-zinc-500 lg:justify-start',
      )}
    >
      <Search className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      <span className="hidden min-w-0 flex-1 truncate lg:inline">Search documentation…</span>
      <span className="hidden shrink-0 items-center gap-0.5 lg:inline-flex">
        <kbd className="rounded border border-docs-border bg-docs-surface px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
          ⌘
        </kbd>
        <kbd className="rounded border border-docs-border bg-docs-surface px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
          K
        </kbd>
      </span>
    </button>
  );
}
