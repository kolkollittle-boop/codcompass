import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Link */}
          <Link href="/blog" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-8 inline-block">
            ← 返回博客列表
          </Link>

          {/* Header */}
          <header className="mb-10 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                React
              </span>
              <span className="text-sm text-gray-500">2026-04-20</span>
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-500">8 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              React Hooks 入门指南
            </h1>
            <div className="flex items-center text-gray-500 text-sm">
              <span>By Codcompass Team</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
            <p>
              React Hooks 在 React 16.8 中引入，彻底改变了我们编写组件的方式。如果你还在使用类组件，那么你错过了更简洁、更易读的代码风格。
            </p>

            <h2>为什么 Hooks 很重要</h2>
            <p>
              在 Hooks 之前，函数组件的能力有限——它们不能保持状态，不能访问生命周期方法，不能轻松复用逻辑。Hooks 改变了这一切。
            </p>
            <p>
              把 Hooks 想象成给函数赋予超能力。一个曾经只接收 props 并返回 JSX 的简单函数，现在可以管理状态、执行副作用，并在组件之间共享逻辑。
            </p>

            <h2>useState Hook</h2>
            <p>这是你最常用的 Hook。它允许你在任何函数组件中添加状态：</p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
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
              这个 API 的美妙之处在于其简洁性。一行代码就给你一个状态变量和一个设置函数。不再有 <code>this.state</code>，不再有 <code>this.setState</code>，不再有绑定。
            </p>

            <h2>useEffect Hook</h2>
            <p>
              副作用是从获取数据到更新 DOM 的一切。useEffect 让你以声明式的方式处理它们：
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
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

            <h2>常见错误</h2>
            <ul>
              <li><strong>无限循环：</strong>忘记依赖数组会导致 useEffect 在每次渲染时运行，触发状态更新，触发渲染...</li>
              <li><strong>过期闭包：</strong>当你的 effect 捕获了变量的旧值时。始终包含依赖或使用函数式更新。</li>
            </ul>

            <h2>专业技巧</h2>
            <ul>
              <li>使用 <code>useCallback</code> 记忆传递给子组件的函数</li>
              <li>使用 <code>useMemo</code> 处理昂贵的计算</li>
              <li>自定义 Hooks 允许你提取和共享有状态的逻辑</li>
              <li>Hooks 规则：只在顶层调用它们，绝不在循环或条件中</li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
