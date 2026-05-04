/** Static seed payloads for `BlogCategory` / `BlogPost` (marketing blog only). */

export const BLOG_SEED_CATEGORIES = [
  { slug: 'react', name: 'React', nameEn: 'React', sortOrder: 10 },
  { slug: 'typescript', name: 'TypeScript', nameEn: 'TypeScript', sortOrder: 20 },
  { slug: 'nextjs', name: 'Next.js', nameEn: 'Next.js', sortOrder: 30 },
  { slug: 'ai-ml', name: 'AI/ML', nameEn: 'AI/ML', sortOrder: 40 },
  { slug: 'devops', name: 'DevOps', nameEn: 'DevOps', sortOrder: 50 },
] as const;

export type BlogSeedPost = {
  slug: string;
  categorySlug: (typeof BLOG_SEED_CATEGORIES)[number]['slug'];
  title: string;
  excerpt: string;
  author: string;
  readingMinutes: number;
  tags: string[];
  publishedAtIso: string;
  contentHtml: string;
};

const counterExample = [
  "import React, { useState } from 'react';",
  '',
  'function Counter() {',
  '  const [count, setCount] = useState(0);',
  '',
  '  return (',
  '    <div>',
  '      <p>You clicked {count} times</p>',
  '      <button onClick={() => setCount(count + 1)}>',
  '        Click me',
  '      </button>',
  '    </div>',
  '  );',
  '}',
].join('\n');

const effectExample = [
  "import { useState, useEffect } from 'react';",
  '',
  'function UserProfile({ userId }) {',
  '  const [user, setUser] = useState(null);',
  '  const [loading, setLoading] = useState(true);',
  '',
  '  useEffect(() => {',
  '    async function fetchUser() {',
  '      const res = await fetch("/api/users/" + userId);',
  '      const data = await res.json();',
  '      setUser(data);',
  '      setLoading(false);',
  '    }',
  '    fetchUser();',
  '  }, [userId]);',
  '',
  '  if (loading) return <p>Loading...</p>;',
  '  return <div>{user.name}</div>;',
  '}',
].join('\n');

const reactHooksHtml = [
  "<p>React Hooks were introduced in React 16.8 and fundamentally changed how we write components. If you're still using class components, you're missing out on cleaner, more readable code.</p>",
  '<h2>Why Hooks Matter</h2>',
  "<p>Before Hooks, functional components were limited — they couldn't hold state, couldn't access lifecycle methods, and couldn't reuse logic easily. Hooks changed all of that.</p>",
  '<p>Think of Hooks as giving superpowers to functions. A simple function that used to just receive props and return JSX can now manage state, perform side effects, and share logic across components.</p>',
  '<h2>useState Hook</h2>',
  '<p>This is your bread and butter. It lets you add state to any functional component:</p>',
  `<pre><code>${escapeHtml(counterExample)}</code></pre>`,
  '<p>The beauty of this API is its simplicity. One line gives you a state variable and a setter function. No more <code>this.state</code>, no more <code>this.setState</code>, no more binding.</p>',
  '<h2>useEffect Hook</h2>',
  '<p>Side effects are everything from fetching data to updating the DOM. useEffect lets you handle them declaratively:</p>',
  `<pre><code>${escapeHtml(effectExample)}</code></pre>`,
  '<h2>Common Mistakes</h2>',
  '<ul>',
  '<li><strong>Infinite loops:</strong> Forgetting the dependency array causes useEffect to run on every render.</li>',
  '<li><strong>Stale closures:</strong> When your effect captures an old value of a variable. Include dependencies or use functional updates.</li>',
  '</ul>',
  '<h2>Pro Tips</h2>',
  '<ul>',
  '<li>Use <code>useCallback</code> to memoize functions passed to child components</li>',
  '<li>Use <code>useMemo</code> for expensive computations</li>',
  '<li>Custom Hooks let you extract and share stateful logic</li>',
  '<li>Hooks Rules: only call them at the top level, never in loops or conditions</li>',
  '</ul>',
].join('');

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const BLOG_SEED_POSTS: BlogSeedPost[] = [
  {
    slug: 'getting-started-with-react-hooks',
    categorySlug: 'react',
    title: 'Getting Started with React Hooks',
    excerpt:
      'From useState to useEffect, master the core concepts and best practices of React Hooks.',
    author: 'Codcompass Team',
    readingMinutes: 8,
    tags: ['React', 'Frontend'],
    publishedAtIso: '2026-04-20T12:00:00.000Z',
    contentHtml: reactHooksHtml,
  },
  {
    slug: 'typescript-advanced-patterns',
    categorySlug: 'typescript',
    title: 'TypeScript Advanced Patterns',
    excerpt:
      'Explore generics, conditional types, template literal types, and other advanced TypeScript features.',
    author: 'Codcompass Team',
    readingMinutes: 10,
    tags: ['TypeScript'],
    publishedAtIso: '2026-04-18T12:00:00.000Z',
    contentHtml:
      '<p>Generics and conditional types let you encode relationships between types instead of duplicating signatures.</p><h2>Conditional types</h2><p>Use them to narrow unions based on inputs—ideal for API clients and event payloads.</p>',
  },
  {
    slug: 'nextjs-15-new-features',
    categorySlug: 'nextjs',
    title: 'Next.js 15 New Features Explained',
    excerpt:
      'Params as Promises, caching strategy changes, streaming rendering, and other major updates explained.',
    author: 'Codcompass Team',
    readingMinutes: 12,
    tags: ['Next.js', 'Web'],
    publishedAtIso: '2026-04-15T12:00:00.000Z',
    contentHtml:
      '<p>Next.js continues to refine the App Router, caching semantics, and streaming so production apps stay predictable.</p><h2>Async request APIs</h2><p>Treat route params and searchParams as async at the framework boundary to align with streaming and partial prerendering.</p>',
  },
  {
    slug: 'ai-powered-development',
    categorySlug: 'ai-ml',
    title: 'AI-Powered Software Development',
    excerpt:
      'How to use AI tools to improve development efficiency, from code generation to automated testing.',
    author: 'Codcompass Team',
    readingMinutes: 6,
    tags: ['AI', 'Productivity'],
    publishedAtIso: '2026-04-12T12:00:00.000Z',
    contentHtml:
      '<p>AI assistants work best when you supply architecture constraints, test harnesses, and clear acceptance criteria.</p><h2>Workflow</h2><p>Keep humans in the loop for security-sensitive changes and schema migrations.</p>',
  },
  {
    slug: 'docker-kubernetes-guide',
    categorySlug: 'devops',
    title: 'Docker & Kubernetes Practical Guide',
    excerpt:
      'From containerized applications to microservices architecture, master modern deployment solutions.',
    author: 'Codcompass Team',
    readingMinutes: 15,
    tags: ['DevOps', 'AWS'],
    publishedAtIso: '2026-04-10T12:00:00.000Z',
    contentHtml:
      '<p>Containers package dependencies consistently; Kubernetes orchestrates scaling and rollouts.</p><h2>Where to start</h2><p>Define health checks, resource requests/limits, and one canonical image tag strategy before worrying about advanced networking.</p>',
  },
];
