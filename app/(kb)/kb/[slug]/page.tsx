import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  date: string;
  readTime: string;
  isPremium: boolean;
  freeContent: string;
  premiumContent: string;
  author: string;
  sources: string[];
}

const articles: Article[] = [
  {
    id: 1,
    slug: 'getting-started-react-hooks',
    title: 'Getting Started with React Hooks',
    category: 'React',
    difficulty: 'Beginner',
    date: '2026-04-15',
    readTime: '5 min read',
    isPremium: true,
    author: 'CPKB Team',
    sources: ['React Docs', 'Kent C. Dodds Blog', 'Dan Abramov Twitter'],
    freeContent: `
<p>React Hooks were introduced in React 16.8 and fundamentally changed how we write components. If you're still using class components, you're missing out on cleaner, more readable code.</p>

<h2>Why Hooks Matter</h2>

<p>Before Hooks, functional components were limited — they couldn't hold state, couldn't access lifecycle methods, and couldn't reuse logic easily. Hooks changed all of that.</p>

<p>Think of Hooks as giving superpowers to functions. A simple function that used to just receive props and return JSX can now manage state, perform side effects, and share logic across components.</p>

<h2>The useState Hook</h2>

<p>This is your bread and butter. It lets you add state to any functional component:</p>

<pre><code>import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;p&gt;You clicked {count} times&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

<p>The beauty of this API is its simplicity. One line gives you a state variable and a setter function. No more <code>this.state</code>, no more <code>this.setState</code>, no more binding.</p>
`,
    premiumContent: `
<h2>The useEffect Hook</h2>

<p>Side effects are everything from fetching data to updating the DOM. useEffect lets you handle them declaratively:</p>

<pre><code>import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =&gt; {
    async function fetchUser() {
      const res = await fetch(\`/api/users/\${userId}\`);
      const data = await res.json();
      setUser(data);
      setLoading(false);
    }
    fetchUser();
  }, [userId]); // Re-run when userId changes

  if (loading) return &lt;p&gt;Loading...&lt;/p&gt;;
  return &lt;div&gt;{user.name}&lt;/div&gt;;
}</code></pre>

<p>The dependency array is crucial. It tells React when to re-run your effect. Leave it empty and it runs once (like componentDidMount). Include variables and it runs whenever they change.</p>

<h2>Common Mistakes</h2>

<p><strong>1. Infinite loops:</strong> Forgetting the dependency array causes useEffect to run on every render, which triggers a state update, which triggers a render... you get the idea.</p>

<p><strong>2. Stale closures:</strong> When your effect captures an old value of a variable. Always include dependencies or use functional updates.</p>

<h2>Pro Tips</h2>

<ul>
  <li>Use <code>useCallback</code> to memoize functions passed to child components</li>
  <li>Use <code>useMemo</code> for expensive computations</li>
  <li>Custom Hooks let you extract and share stateful logic</li>
  <li>Rules of Hooks: only call them at the top level, never in loops or conditions</li>
</ul>

<p>That's the foundation. Master these and you'll write React code that's cleaner, more maintainable, and frankly more enjoyable.</p>
`,
  },
  {
    id: 2,
    slug: 'typescript-best-practices',
    title: 'TypeScript Best Practices',
    category: 'TypeScript',
    difficulty: 'Intermediate',
    date: '2026-04-12',
    readTime: '8 min read',
    isPremium: true,
    author: 'CPKB Team',
    sources: ['TypeScript Handbook', 'Matt Pocock Blog', 'Total TypeScript'],
    freeContent: `
<p>TypeScript isn't just JavaScript with types — it's a fundamentally better way to write software. Once you've experienced the safety net of a good type system, going back feels like walking without a railing.</p>

<h2>Interfaces vs Types</h2>

<p>Both define shapes, but they have different strengths:</p>

<pre><code>// Use interfaces for object shapes (extensible)
interface User {
  id: number;
  name: string;
  email: string;
}

// Use types for unions, intersections, and mapped types
type Status = 'active' | 'inactive' | 'pending';
type Result&lt;T&gt; = { success: true; data: T } | { success: false; error: string };</code></pre>

<p><strong>Rule of thumb:</strong> Interfaces for objects you might extend, types for everything else.</p>
`,
    premiumContent: `
<h2>Strict Mode is Non-Negotiable</h2>

<p>Enable <code>"strict": true</code> in your tsconfig. Yes, it will break your code. That's the point — it's finding bugs before they reach production.</p>

<h2>Avoid Any Like the Plague</h2>

<p><code>any</code> defeats the entire purpose of TypeScript. Use <code>unknown</code> instead when you genuinely don't know the type.</p>

<h2>Pro Tips</h2>

<ul>
  <li>Use <code>as const</code> for readonly literal types</li>
  <li>Template literal types for type-safe routing and API paths</li>
  <li>Generics when the type depends on input</li>
  <li>Zod for runtime validation that matches your TypeScript types</li>
</ul>
`,
  },
  {
    id: 3,
    slug: 'nextjs-15-features',
    title: 'Next.js 15 Features You Need to Know',
    category: 'Next.js',
    difficulty: 'Intermediate',
    date: '2026-04-10',
    readTime: '10 min read',
    isPremium: false,
    author: 'CPKB Team',
    sources: ['Next.js Blog', 'Lee Robinson Twitter'],
    freeContent: `
<p>Next.js 15 shipped with some significant changes. If you're upgrading from 14, there are a few breaking changes you need to know about — and some exciting new features worth exploring.</p>

<h2>Params and SearchParams are Now Promises</h2>

<p>The biggest breaking change: <code>params</code> and <code>searchParams</code> in page components are now async. This enables streaming and better performance, but requires code changes:</p>

<pre><code>// ❌ Next.js 14
export default function Page({ params }: { params: { id: string } }) {

// ✅ Next.js 15
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}</code></pre>

<h2>Caching Changes</h2>

<p>Fetch requests are no longer cached by default. This simplifies mental model — if you want caching, you opt in:</p>

<pre><code>// Opt into caching with revalidation
fetch('/api/data', { next: { revalidate: 3600 } });

// Or force dynamic rendering
export const dynamic = 'force-dynamic';</code></pre>

<h2>Why This Matters</h2>

<p>The caching changes in Next.js 15 are actually a good thing. The old system was confusing — developers constantly ran into stale data issues. Now the default is "always fresh," which is what most people want anyway.</p>

<p>If you do need caching (and you should, for expensive operations), the <code>revalidate</code> pattern is clean and explicit. You know exactly what's cached and for how long.</p>
`,
    premiumContent: '',
  },
];

function difficultyColor(d: string) {
  switch (d) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params;
  
  const article = articles.find(a => 
    a.slug === resolved.slug || a.id === parseInt(resolved.slug)
  );

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">CPKB</Link>
            <Link href="/kb" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to KB
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Header */}
          <header className="mb-10 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {article.category}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${difficultyColor(article.difficulty)}`}>
                {article.difficulty}
              </span>
              {article.isPremium && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  🔒 Premium
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="flex items-center text-gray-500 text-sm space-x-4">
              <span>By {article.author}</span>
              <span>·</span>
              <time dateTime={article.date}>{article.date}</time>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>
          </header>

          {/* Free Content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
              prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
              prose-li:text-gray-700 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: article.freeContent }}
          />

          {/* Premium Content with Paywall */}
          {article.isPremium && article.premiumContent && (
            <div className="relative mt-10">
              {/* Blurred preview */}
              <div className="blur-md select-none pointer-events-none opacity-30" aria-hidden="true">
                <div 
                  className="prose prose-lg max-w-none
                    prose-headings:font-bold prose-p:text-gray-700
                    prose-pre:bg-gray-900 prose-pre:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: article.premiumContent }}
                />
              </div>

              {/* Paywall overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-t from-white via-white/95 to-transparent w-full h-full flex items-end sm:items-center justify-center pb-8 sm:pb-0">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 max-w-md mx-4 text-center">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Article</h3>
                    <p className="text-gray-600 mb-6">
                      Get unlimited access to all premium tutorials, code examples, and expert insights.
                    </p>
                    <Link
                      href="/pricing"
                      className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Subscribe from $9.99/mo
                    </Link>
                    <p className="text-xs text-gray-500 mt-3">
                      Cancel anytime · 30-day money-back guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Free article - show premium content directly */}
          {!article.isPremium && article.premiumContent && (
            <div 
              className="prose prose-lg max-w-none mt-8
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
                prose-a:text-indigo-600 prose-a:no-underline"
              dangerouslySetInnerHTML={{ __html: article.premiumContent }}
            />
          )}

          {/* Sources */}
          {article.sources.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources</h3>
              <ul className="space-y-1">
                {article.sources.map((source, i) => (
                  <li key={i} className="text-sm text-gray-600">• {source}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CPKB. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
