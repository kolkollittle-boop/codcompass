#!/usr/bin/env node
/**
 * Seed articles via API
 * Usage: npx tsx scripts/seed-articles-api.ts
 */

const API_URL = process.env.API_URL || 'https://www.codcompass.com/api/articles';
const API_KEY = process.env.API_KEY || '';

const articles = [
  {
    slug: 'react-hooks-deep-dive',
    titleEn: 'React Hooks Deep Dive',
    contentEn: `<h2>Introduction to React Hooks</h2>
<p>React Hooks were introduced in React 16.8 and fundamentally changed how we write React components. They allow you to use state and other React features without writing a class.</p>
<h2>useState Hook</h2>
<p>The useState hook is the most basic hook. It lets you add state to functional components:</p>
<pre><code>const [count, setCount] = useState(0);</code></pre>
<h2>useEffect Hook</h2>
<p>useEffect lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.</p>
<h2>Custom Hooks</h2>
<p>Custom Hooks let you extract component logic into reusable functions. A custom Hook is a JavaScript function whose name starts with "use" and that may call other Hooks.</p>`,
    excerptEn: 'Master React Hooks including useState, useEffect, and custom hooks with practical examples.',
    descriptionEn: 'Complete guide to React Hooks with deep dive into useState, useEffect, useContext, and creating custom hooks.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'react',
  },
  {
    slug: 'typescript-generics-mastery',
    titleEn: 'TypeScript Generics: From Basic to Advanced',
    contentEn: `<h2>What are Generics?</h2>
<p>Generics provide a way to create reusable components that work with any data type. They allow you to write a function or class that works with multiple types while preserving type safety.</p>
<h2>Generic Functions</h2>
<pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}</code></pre>
<h2>Generic Constraints</h2>
<p>You can use extends to constrain the types that can be used with a generic:</p>
<pre><code>interface HasLength {
  length: number;
}

function logLength&lt;T extends HasLength&gt;(arg: T): void {
  console.log(arg.length);
}</code></pre>
<h2>Advanced Patterns</h2>
<p>Learn about conditional types, mapped types, and template literal types for advanced TypeScript programming.</p>`,
    excerptEn: 'Master TypeScript generics from basics to advanced patterns including constraints and conditional types.',
    descriptionEn: 'Complete guide to TypeScript generics with practical examples and advanced patterns.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'typescript',
  },
  {
    slug: 'nextjs-15-server-components',
    titleEn: 'Next.js 15 Server Components: Complete Guide',
    contentEn: `<h2>What are Server Components?</h2>
<p>React Server Components allow you to write UI that can be rendered on the server. They reduce the amount of JavaScript sent to the client and improve performance.</p>
<h2>Key Benefits</h2>
<ul>
  <li>Zero bundle size for server components</li>
  <li>Direct access to backend resources</li>
  <li>Automatic code splitting</li>
  <li>Improved initial page load</li>
</ul>
<h2>Best Practices</h2>
<p>Learn when to use Server Components vs Client Components, how to handle interactivity, and how to optimize your Next.js 15 applications.</p>`,
    excerptEn: 'Learn Next.js 15 Server Components with practical examples and best practices.',
    descriptionEn: 'Complete guide to Next.js 15 Server Components with performance optimization tips.',
    isPremium: false,
    isPublished: true,
    categorySlug: 'nextjs',
  },
  {
    slug: 'ai-code-generation-tools',
    titleEn: 'AI-Powered Code Generation Tools',
    contentEn: `<h2>The AI Revolution in Development</h2>
<p>AI-powered tools are transforming how developers write code. From autocomplete to full function generation, these tools can significantly boost productivity.</p>
<h2>Popular Tools</h2>
<ul>
  <li><strong>GitHub Copilot</strong> - AI pair programmer</li>
  <li><strong>Claude Code</strong> - Coding assistant</li>
  <li><strong>Cursor</strong> - AI-first code editor</li>
</ul>
<h2>Best Practices</h2>
<p>Learn how to effectively use AI coding assistants while maintaining code quality and security.</p>`,
    excerptEn: 'Explore AI-powered coding tools and learn how to use them effectively in your workflow.',
    descriptionEn: 'Complete guide to AI coding assistants including GitHub Copilot, Claude Code, and more.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'ai-ml',
  },
  {
    slug: 'docker-kubernetes-beginner',
    titleEn: 'Docker & Kubernetes for Beginners',
    contentEn: `<h2>Why Containerization?</h2>
<p>Containers solve the "it works on my machine" problem by packaging your application with all its dependencies into a standardized unit.</p>
<h2>Docker Basics</h2>
<pre><code>FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]</code></pre>
<h2>Kubernetes Fundamentals</h2>
<p>Learn about Pods, Deployments, Services, and how to orchestrate containers at scale.</p>`,
    excerptEn: 'Learn Docker and Kubernetes from scratch with practical examples and best practices.',
    descriptionEn: 'Beginner-friendly guide to containerization with Docker and orchestration with Kubernetes.',
    isPremium: false,
    isPublished: true,
    categorySlug: 'devops',
  },
];

async function seedArticles() {
  console.log('🌱 Seeding articles via API...');
  console.log('API URL:', API_URL);
  
  if (!API_KEY) {
    console.warn('⚠️  No API_KEY provided. Using empty key.');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        articles: articles,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Successfully seeded articles!');
      console.log('Processed:', result.processed);
      console.log('Results:', JSON.stringify(result.results, null, 2));
    } else {
      console.error('❌ API Error:', result);
    }
  } catch (error: any) {
    console.error('❌ Failed to seed articles:', error.message);
  }
}

seedArticles();
