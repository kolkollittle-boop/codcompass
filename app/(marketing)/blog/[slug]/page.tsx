import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Link */}
          <Link href="/blog" className="text-palette-primary hover:text-palette-accent text-sm font-medium mb-8 inline-block">
            ← Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10 pb-8 border-b border-palette-border">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary">
                React
              </span>
              <span className="text-sm text-palette-textMuted">2026-04-20</span>
              <span className="text-sm text-palette-textMuted">·</span>
              <span className="text-sm text-palette-textMuted">8 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Getting Started with React Hooks
            </h1>
            <div className="flex items-center text-palette-textMuted text-sm">
              <span>By Codcompass Team</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-palette-textSecondary prose-p:leading-relaxed prose-a:text-palette-primary prose-code:text-palette-textSecondary">
            <p>
              React Hooks were introduced in React 16.8 and fundamentally changed how we write components. If you're still using class components, you're missing out on cleaner, more readable code.
            </p>

            <h2>Why Hooks Matter</h2>
            <p>
              Before Hooks, functional components were limited — they couldn't hold state, couldn't access lifecycle methods, and couldn't reuse logic easily. Hooks changed all of that.
            </p>
            <p>
              Think of Hooks as giving superpowers to functions. A simple function that used to just receive props and return JSX can now manage state, perform side effects, and share logic across components.
            </p>

            <h2>useState Hook</h2>
            <p>This is your bread and butter. It lets you add state to any functional component:</p>
            <pre className="bg-palette-bgCard text-palette-textPrimary border border-palette-border rounded-lg p-4 overflow-x-auto">
              <code>{`import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`}</code>
            </pre>
            <p>
              The beauty of this API is its simplicity. One line gives you a state variable and a setter function. No more <code>this.state</code>, no more <code>this.setState</code>, no more binding.
            </p>

            <h2>useEffect Hook</h2>
            <p>
              Side effects are everything from fetching data to updating the DOM. useEffect lets you handle them declaratively:
            </p>
            <pre className="bg-palette-bgCard text-palette-textPrimary border border-palette-border rounded-lg p-4 overflow-x-auto">
              <code>{`import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(\`/api/users/\${userId}\`);
      const data = await res.json();
      setUser(data);
      setLoading(false);
    }
    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  return <div>{user.name}</div>;
}`}</code>
            </pre>

            <h2>Common Mistakes</h2>
            <ul>
              <li><strong>Infinite loops:</strong> Forgetting the dependency array causes useEffect to run on every render, triggering a state update, triggering a render...</li>
              <li><strong>Stale closures:</strong> When your effect captures an old value of a variable. Always include dependencies or use functional updates.</li>
            </ul>

            <h2>Pro Tips</h2>
            <ul>
              <li>Use <code>useCallback</code> to memoize functions passed to child components</li>
              <li>Use <code>useMemo</code> for expensive computations</li>
              <li>Custom Hooks let you extract and share stateful logic</li>
              <li>Hooks Rules: only call them at the top level, never in loops or conditions</li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
