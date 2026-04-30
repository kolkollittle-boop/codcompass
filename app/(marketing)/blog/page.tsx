'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  },
];

const categories = ['All', 'React', 'TypeScript', 'Next.js', 'AI/ML', 'DevOps'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-600/20 via-zinc-900 to-purple-600/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Technical Blog
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Latest technical tutorials, best practices, and deep dives
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-zinc-900 rounded-xl shadow-lg p-4 flex flex-wrap gap-2 justify-center border border-zinc-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {filteredPosts.length > 0 ? filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {post.category}
                  </span>
                  <span className="text-sm text-zinc-500">{post.date}</span>
                  <span className="text-sm text-zinc-500">·</span>
                  <span className="text-sm text-zinc-500">{post.readTime}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  <Link href={`/blog/${post.slug}`} className="hover:text-indigo-400 transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-zinc-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">By {post.author}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            )) : (
              <p className="text-center text-zinc-400 py-8">No posts in this category yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
