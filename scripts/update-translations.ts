#!/usr/bin/env node
/**
 * Update Chinese translations with proper content
 * Usage: npx tsx scripts/update-translations.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Chinese translations for key articles
const chineseTranslations: Record<string, {
  title: string;
  content: string;
  excerpt: string;
  description: string;
}> = {
  'react-hooks-deep-dive': {
    title: 'React Hooks 深入指南：超越 useState 和 useEffect',
    content: `<h2>🎯 为什么 Hooks 改变了游戏规则</h2>
<p>还记得 class 组件里那个长得像俄罗斯套娃的 componentDidMount 吗？Hooks 就是来救命的。</p>
<p>在 Hooks 出现之前，函数组件很受限——不能保存状态，不能访问生命周期方法，不能轻松复用逻辑。Hooks 改变了这一切。</p>

<h3>💡 useState：你的基础工具</h3>
<p>这是你的面包和黄油。它让你在任何函数组件中添加状态：</p>

<pre><code>import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    &lt;div&gt;
      &lt;p&gt;你点击了 {count} 次&lt;/p&gt;
      &lt;button onClick={() => setCount(count + 1)}&gt;
        点击我
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

<p>这个 API 的美妙之处在于它的简洁。一行代码就给了你一个状态变量和一个设置函数。不再有 <code>this.state</code>，不再有 <code>this.setState</code>，不再有绑定。</p>

<h3>🔄 useEffect：处理副作用</h3>

<pre><code>import { useState, useEffect } from 'react';

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
  }, [userId]); // 当 userId 变化时重新运行
  
  if (loading) return &lt;p&gt;加载中...&lt;/p&gt;;
  return &lt;div&gt;{user.name}&lt;/div&gt;;
}</code></pre>

<p>依赖数组很关键。它告诉 React 何时重新运行你的 effect。留空则只运行一次（像 componentDidMount）。包含变量则每当它们变化时运行。</p>

<h3>⚠️ 常见错误</h3>
<ul>
<li><strong>无限循环：</strong>忘记依赖数组会导致 useEffect 在每次渲染时运行，触发状态更新，触发渲染...你懂的</li>
<li><strong>过时的闭包：</strong>当你的 effect 捕获了变量的旧值时。始终包含依赖或使用函数更新</li>
</ul>

<h3>🚀 进阶技巧</h3>
<ul>
<li>使用 <code>useCallback</code> 记忆传递给子组件的函数</li>
<li>使用 <code>useMemo</code> 处理昂贵的计算</li>
<li>自定义 Hooks 让你提取和共享状态逻辑</li>
<li>Hooks 规则：只在顶层调用，绝不在循环或条件中调用</li>
</ul>

<p>好了，Hooks 的基本玩法就这些。剩下的坑，你迟早会踩到的 😏</p>`,
    excerpt: '深入掌握 React Hooks：useState、useEffect 和自定义 Hooks。从基础到高级模式。',
    description: 'React Hooks 完整指南：从基础到高级，包括自定义 Hooks 和最佳实践。',
  },
  'typescript-generics-mastery': {
    title: 'TypeScript 泛型精通：从基础到高级模式',
    content: `<h2>🎯 什么是泛型？</h2>
<p>泛型让你创建可复用的组件，这些组件可以与多种类型一起工作，同时保持类型安全。</p>

<h3>💡 基础泛型函数</h3>

<pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}

// 使用
const result = identity&lt;string&gt;('hello');
const num = identity(42); // 类型推断</code></pre>

<h3>🔧 泛型约束</h3>
<p>使用约束来限制可以传递给泛型的类型：</p>

<pre><code>interface HasLength {
  length: number;
}

function logLength&lt;T extends HasLength&gt;(arg: T): T {
  console.log(arg.length);
  return arg;
}</code></pre>

<h3>📦 实际应用</h3>
<p>泛型在 API 响应、表单处理和状态管理中大放异彩。以下是类型化的 API 响应模式：</p>

<pre><code>type ApiResponse&lt;T&gt; = {
  data: T;
  status: number;
  message: string;
}

async function fetchData&lt;T&gt;(url: string): Promise&lt;ApiResponse&lt;T&gt;&gt; {
  const res = await fetch(url);
  return res.json();
}</code></pre>

<h3>⚠️ 常见坑</h3>
<ul>
<li><strong>过度使用泛型：</strong>不是每个函数都需要泛型。保持简单</li>
<li><strong>缺少约束：</strong>总是约束你的泛型，除非你真的需要任何类型</li>
<li><strong>复杂类型推断：</strong>TypeScript 的类型推断很强大，但有时需要帮助</li>
</ul>

<h3>🚀 高级模式</h3>
<ul>
<li>条件类型：<code>Type extends Other ? True : False</code></li>
<li>映射类型：转换现有类型</li>
<li>模板字面量类型：类型安全的字符串操作</li>
</ul>

<p>现在去你的项目里试试，别光收藏不练！</p>`,
    excerpt: '掌握 TypeScript 泛型：从基础函数到高级模式，包括约束和实际应用。',
    description: 'TypeScript 泛型完整指南：从基础到高级，包括条件类型和映射类型。',
  },
  'nextjs-15-server-components': {
    title: 'Next.js 15 服务器组件：完整指南',
    content: `<h2>🎯 服务器组件改变了什么</h2>
<p>Next.js 15 带来了重大变化。如果你从 14 升级，有几个破坏性更新需要了解——还有一些令人兴奋的新功能值得探索。</p>

<h3>💡 Params 和 SearchParams 现在是 Promise</h3>
<p>最大的破坏性更新：页面组件中的 <code>params</code> 和 <code>searchParams</code> 现在是 async 的。这支持流式传输和更好的性能，但需要代码更改：</p>

<pre><code>// ❌ Next.js 14
export default function Page({ params }: { params: { id: string } }) {

// ✅ Next.js 15
export default async function Page({ params }: { params: Promise&lt;{ id: string }&gt; }) {
  const { id } = await params;
}</code></pre>

<h3>🔄 缓存变化</h3>
<p>Fetch 请求不再默认缓存。这简化了心智模型——如果你想要缓存，你选择加入：</p>

<pre><code>// 选择加入缓存，使用 revalidation
fetch('/api/data', { next: { revalidate: 3600 } });

// 或强制动态渲染
export const dynamic = 'force-dynamic';</code></pre>

<h3>⚠️ 为什么这很重要</h3>
<p>Next.js 15 中的缓存变化实际上是件好事。旧系统很令人困惑——开发者经常遇到过时数据的问题。现在默认是"始终新鲜"，这正是大多数人想要的。</p>

<p>如果你确实需要缓存（你应该，对于昂贵的操作），<code>revalidate</code> 模式很干净和明确。你确切知道什么被缓存了以及缓存多久。</p>

<h3>🚀 最佳实践</h3>
<ul>
<li>服务器组件用于数据获取和渲染</li>
<li>客户端组件用于交互和状态</li>
<li>使用 <code>'use client'</code> 指令明确标记客户端组件</li>
<li>利用流式 SSR 获得更好的性能</li>
</ul>

<p>好了，服务器组件的基本玩法就这些。剩下的坑，你迟早会踩到的 😏</p>`,
    excerpt: 'Next.js 15 服务器组件完整指南：Params 作为 Promise、缓存变化和最佳实践。',
    description: '掌握 Next.js 15 服务器组件：从基础到高级，包括流式传输和缓存策略。',
  },
};

async function main() {
  console.log('🚀 Starting translation update...');
  
  // Fetch all published articles
  const { data: articles, error: fetchError } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, excerptEn, descriptionEn')
    .eq('status', 'PUBLISHED');
  
  if (fetchError || !articles) {
    console.error('❌ Failed to fetch articles:', fetchError);
    process.exit(1);
  }
  
  console.log(`📝 Found ${articles.length} articles`);
  
  let updated = 0;
  let errors = 0;
  
  for (const article of articles) {
    const translation = chineseTranslations[article.slug];
    
    if (translation) {
      // Update with proper Chinese translation
      const now = new Date().toISOString();
      // Delete existing translation first
      await supabase
        .from('ArticleTranslation')
        .delete()
        .eq('articleId', article.id)
        .eq('locale', 'zh');
      
      // Then insert new translation
      const { error: updateError } = await supabase
        .from('ArticleTranslation')
        .insert({
          id: crypto.randomUUID(),
          articleId: article.id,
          locale: 'zh',
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt,
          description: translation.description,
          isAutoTranslated: false,
          isReviewed: true,
          translatedAt: now,
          updatedAt: now,
        });
      
      if (updateError) {
        console.error(`❌ Failed to update ${article.slug}:`, updateError.message);
        errors++;
      } else {
        updated++;
        console.log(`✅ Updated: ${article.slug}`);
      }
    } else {
      // For articles without custom translation, keep existing
      console.log(`⏭️  Skipped: ${article.slug} (no custom translation)`);
    }
  }
  
  console.log(`\n✅ Done! Updated ${updated} articles, ${errors} errors`);
}

main().catch(console.error);
