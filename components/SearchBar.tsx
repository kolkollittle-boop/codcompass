'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  slug: string;
  titleEn: string;
  excerptEn: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.results) {
          setResults(json.results);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-palette-textMuted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2 border border-palette-border rounded-lg bg-palette-bgCard text-palette-textPrimary placeholder-palette-textMuted focus:ring-2 focus:ring-palette-primary focus:border-palette-primary text-sm"
        />
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-palette-bgCard rounded-lg shadow-lg border border-palette-border max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-palette-textMuted">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={(`/kb/${result.slug}`) as any}
                  className="block px-4 py-3 hover:bg-palette-bgTertiary transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  <h4 className="text-sm font-medium text-palette-textPrimary">{result.titleEn}</h4>
                  {result.excerptEn && (
                    <p className="text-xs text-palette-textMuted mt-1 line-clamp-2">
                      {result.excerptEn.slice(0, 100)}...
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-palette-textMuted">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
