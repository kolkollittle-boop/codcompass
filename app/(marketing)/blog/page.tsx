'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/ui';

const blogPosts = [
  {
    id: 1,
    slug: 'getting-started-with-react-hooks',
    title: 'Getting Started with React Hooks',
    excerpt: 'From useState to useEffect, master the core concepts and best practices of React Hooks.',
    category: 'React',
    date: '2026-04-20',
    readTime: '8 min read',
    author: 'Codcompass Team',
    tags: ['React', 'Frontend'],
  },
  {
    id: 2,
    slug: 'typescript-advanced-patterns',
    title: 'TypeScript Advanced Patterns',
    excerpt: 'Explore generics, conditional types, template literal types, and other advanced TypeScript features.',
    category: 'TypeScript',
    date: '2026-04-18',
    readTime: '10 min read',
    author: 'Codcompass Team',
    tags: ['TypeScript'],
  },
  {
    id: 3,
    slug: 'nextjs-15-new-features',
    title: 'Next.js 15 New Features Explained',
    excerpt: 'Params as Promises, caching strategy changes, streaming rendering, and other major updates explained.',
    category: 'Next.js',
    date: '2026-04-15',
    readTime: '12 min read',
    author: 'Codcompass Team',
    tags: ['Next.js', 'Web'],
  },
  {
    id: 4,
    slug: 'ai-powered-development',
    title: 'AI-Powered Software Development',
    excerpt: 'How to use AI tools to improve development efficiency, from code generation to automated testing.',
    category: 'AI/ML',
    date: '2026-04-12',
    readTime: '6 min read',
    author: 'Codcompass Team',
    tags: ['AI', 'Productivity'],
  },
  {
    id: 5,
    slug: 'docker-kubernetes-guide',
    title: 'Docker & Kubernetes Practical Guide',
    excerpt: 'From containerized applications to microservices architecture, master modern deployment solutions.',
    category: 'DevOps',
    date: '2026-04-10',
    readTime: '15 min read',
    author: 'Codcompass Team',
    tags: ['DevOps', 'AWS'],
  },
];

const categories = ['All', 'React', 'TypeScript', 'Next.js', 'AI/ML', 'DevOps'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    let list = selectedCategory === 'All' ? blogPosts : blogPosts.filter((p) => p.category === selectedCategory);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [selectedCategory, query]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-site flex-1 gap-0 px-4 py-8 sm:px-6 lg:gap-10 lg:px-8 lg:py-10">
        {/* Left filter column */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <h2 className="text-sm font-semibold text-docs-heading">Filters</h2>
          <p className="mt-1 text-xs text-docs-muted">Category</p>
          <nav className="mt-3 space-y-1" aria-label="Blog categories">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border border-docs-border bg-white/[0.06] font-medium text-docs-heading'
                      : 'text-docs-body hover:bg-white/5 hover:text-docs-heading'
                  }`}
                >
                  {cat === 'All' ? 'All' : cat}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-docs-heading sm:text-4xl">
            Blog
            {selectedCategory !== 'All' ? (
              <span className="text-docs-muted"> — {selectedCategory}</span>
            ) : null}
          </h1>
          <p className="mt-2 max-w-2xl text-docs-body">Tutorials, best practices, and in-depth breakdowns.</p>

          {/* Search */}
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

          {/* Mobile: category chips */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  selectedCategory === cat
                    ? 'bg-white/[0.08] text-docs-heading ring-1 ring-docs-border'
                    : 'bg-docs-surface text-docs-body ring-1 ring-docs-border'
                }`}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* Card grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
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
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-docs-accent"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-docs-body">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-docs-border pt-4 text-xs text-docs-muted">
                    <span>{post.author}</span>
                    <span>
                      {post.date} · {post.readTime}
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
              <p className="col-span-full py-12 text-center text-docs-muted">No matching articles.</p>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
