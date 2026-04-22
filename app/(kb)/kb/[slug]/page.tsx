import { notFound } from 'next/navigation';
import Link from 'next/link';
import Paywall from '@/components/Paywall';

// Mock data for demonstration
const articles = [
  {
    id: 1,
    title: 'Getting Started with React Hooks',
    content: `
      <p>React Hooks were introduced in React 16.8 to allow you to use state and other React features without writing a class.</p>

      <h2 className="text-2xl font-bold mt-6 mb-4">useState Hook</h2>
      <p>The useState Hook allows you to have state variables in functional components.</p>

      <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>import React, { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}</code></pre>

      <h2 className="text-2xl font-bold mt-6 mb-4">useEffect Hook</h2>
      <p>The useEffect Hook allows you to perform side effects in function components.</p>

      <p>Some examples of side effects are: fetching data, directly updating the DOM, and timers.</p>

      <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}</code></pre>
    `,
    category: 'React',
    date: '2023-06-15',
    readTime: '5 min read',
    isPremium: true,
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    content: `
      <p>TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.</p>

      <h2 className="text-2xl font-bold mt-6 mb-4">Interface Declaration</h2>
      <p>Use interfaces to define the shape of objects in your application.</p>

      <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  isActive: true
};</code></pre>

      <h2 className="text-2xl font-bold mt-6 mb-4">Union Types</h2>
      <p>Union types allow you to define a value that can be one of several types.</p>

      <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>type Status = 'active' | 'inactive' | 'pending';

const updateUserStatus = (id: number, status: Status) => {
  // Update user status logic
};</code></pre>
    `,
    category: 'TypeScript',
    date: '2023-07-22',
    readTime: '8 min read',
    isPremium: false,
  },
];

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params;
  const articleId = parseInt(resolved.slug);
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-8">
        <Link href="/kb" className="inline-flex items-center text-indigo-600 hover:text-indigo-900">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Knowledge Base
        </Link>
      </nav>

      <article>
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {article.category}
            </span>
            <span className="text-sm text-gray-500">{article.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center text-gray-600">
            <span>{article.readTime}</span>
            {article.isPremium && (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Premium
              </span>
            )}
          </div>
        </header>

        {article.isPremium && (
          <Paywall />
        )}

        <div
          className={`prose prose-lg max-w-none ${article.isPremium ? 'blur-sm pointer-events-none' : ''}`}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}