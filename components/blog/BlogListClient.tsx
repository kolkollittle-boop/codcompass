'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/ui';
import type { BlogPostCardDTO, BlogCategoryDTO } from '@/lib/blog-queries';

const ALL = '__all__';
const PAGE_SIZE = 9;

export function BlogListClient({
  posts,
  categories,
}: {
  posts: BlogPostCardDTO[];
  categories: BlogCategoryDTO[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const navItems = useMemo(() => [{ slug: ALL, name: 'All' }, ...categories], [categories]);

  const filteredPosts = useMemo(() => {
    let list =
      selectedSlug === ALL ? posts : posts.filter((p) => p.categorySlug === selectedSlug);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt?.toLowerCase().includes(q) ?? false) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [posts, selectedSlug, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [selectedSlug]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedPosts = useMemo(
    () =>
      filteredPosts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredPosts, currentPage],
  );

  const selectedLabel =
    selectedSlug === ALL ? 'All' : categories.find((c) => c.slug === selectedSlug)?.name ?? 'All';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-site flex-1 gap-0 px-4 py-8 sm:px-6 lg:gap-10 lg:px-8 lg:py-10">
        <aside className="hidden w-52 shrink-0 lg:block">
          <h2 className="text-sm font-semibold text-docs-heading">Filters</h2>
          <p className="mt-1 text-xs text-docs-muted">Category</p>
          <nav className="mt-3 space-y-1" aria-label="Blog categories">
            {navItems.map((cat) => {
              const active = selectedSlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedSlug(cat.slug)}
                  className={`flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border border-docs-border bg-white/[0.06] font-medium text-docs-heading'
                      : 'text-docs-body hover:bg-white/5 hover:text-docs-heading'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-docs-heading sm:text-4xl">
            Blog
            {selectedSlug !== ALL ? (
              <span className="text-docs-muted"> — {selectedLabel}</span>
            ) : null}
          </h1>
          <p className="mt-2 max-w-2xl text-docs-body">
            Field notes and lessons learned from practitioners—experience-rich articles, separate from the Knowledge Base.
          </p>

          <div className="relative mt-8">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-docs-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              className="docs-card w-full rounded-lg border border-docs-border bg-docs-surface py-2.5 pl-10 pr-4 text-sm text-docs-heading placeholder:text-docs-muted outline-none ring-docs-accent/30 focus:ring-2 focus:ring-docs-accent"
            />
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedSlug(cat.slug)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  selectedSlug === cat.slug
                    ? 'bg-white/[0.08] text-docs-heading ring-1 ring-docs-border'
                    : 'bg-docs-surface text-docs-body ring-1 ring-docs-border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <article
                  key={post.id}
                  className="docs-card group flex flex-col rounded-xl border border-docs-border bg-docs-surface p-6 transition-shadow hover:shadow-lg hover:shadow-black/20"
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-docs-secondary ring-1 ring-docs-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-semibold text-docs-heading">
                    <Link href={`/blog/${post.slug}`} className="hover:text-docs-accent">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-docs-body">
                    {post.excerpt ?? ''}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-docs-border pt-4 text-xs text-docs-muted">
                    <span>{post.author ?? ''}</span>
                    <span>
                      {post.publishedAt ? post.publishedAt.slice(0, 10) : '—'}{' '}
                      · {post.readingMinutes} min read
                    </span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-3 inline-flex text-sm font-medium text-docs-accent hover:text-docs-accent-hover"
                  >
                    Read full article →
                  </Link>
                </article>
              ))
            ) : (
              <p className="col-span-full py-12 text-center text-docs-muted">
                {posts.length === 0
                  ? 'No blog posts yet. Run npx tsx scripts/seed-blog.ts after migrating the database.'
                  : 'No matching articles.'}
              </p>
            )}
          </div>

          {filteredPosts.length > 0 && totalPages > 1 ? (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-sm text-docs-muted">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredPosts.length)} of {filteredPosts.length}
              </p>
              <nav className="flex items-center gap-2" aria-label="Blog list pages">
                {currentPage > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    className="docs-card inline-flex items-center gap-1 rounded-lg border border-docs-border px-4 py-2 text-sm font-medium text-docs-body transition-colors hover:bg-white/[0.03]"
                  >
                    <Icon name="chevron-left" size={16} />
                    Previous
                  </button>
                ) : null}

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 2
                    );
                  })
                  .map((p, index, array) => {
                    const showEllipsis = index > 0 && p - array[index - 1] > 1;
                    return (
                      <div key={p} className="flex items-center">
                        {showEllipsis ? (
                          <span className="px-2 text-docs-muted">...</span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            p === currentPage
                              ? 'bg-white/[0.12] text-docs-heading ring-1 ring-docs-border'
                              : 'docs-card border border-docs-border text-docs-body hover:bg-white/[0.03]'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}

                {currentPage < totalPages ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="docs-card inline-flex items-center gap-1 rounded-lg border border-docs-border px-4 py-2 text-sm font-medium text-docs-body transition-colors hover:bg-white/[0.03]"
                  >
                    Next
                    <Icon name="chevron-right" size={16} />
                  </button>
                ) : null}
              </nav>
            </div>
          ) : null}
        </main>
      </div>

      <Footer />
    </div>
  );
}
