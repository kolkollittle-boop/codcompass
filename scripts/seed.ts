#!/usr/bin/env node
/**
 * Seed script for CPKB database
 * Populates Supabase with sample articles, categories, and tags
 * 
 * Usage: npx tsx scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'react',
        name: 'React',
        nameEn: 'React',
        description: 'React tutorials and best practices',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'typescript',
        name: 'TypeScript',
        nameEn: 'TypeScript',
        description: 'TypeScript guides and patterns',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'nextjs',
        name: 'Next.js',
        nameEn: 'Next.js',
        description: 'Next.js framework tutorials',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'ai-ml',
        name: 'AI/ML',
        nameEn: 'AI/ML',
        description: 'Artificial Intelligence and Machine Learning',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'devops',
        name: 'DevOps',
        nameEn: 'DevOps',
        description: 'DevOps practices and tools',
        order: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { slug: 'hooks', name: 'Hooks', nameEn: 'Hooks' },
    }),
    prisma.tag.create({
      data: { slug: 'state-management', name: 'State Management', nameEn: 'State Management' },
    }),
    prisma.tag.create({
      data: { slug: 'typescript', name: 'TypeScript', nameEn: 'TypeScript' },
    }),
    prisma.tag.create({
      data: { slug: 'performance', name: 'Performance', nameEn: 'Performance' },
    }),
    prisma.tag.create({
      data: { slug: 'security', name: 'Security', nameEn: 'Security' },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create sample articles
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        slug: 'react-hooks-deep-dive',
        titleEn: 'React Hooks Deep Dive: Beyond useState and useEffect',
        contentEn: `
<h2>Understanding Custom Hooks</h2>
<p>Custom hooks are one of the most powerful features in React. They let you extract component logic into reusable functions.</p>

<h3>When to Create a Custom Hook</h3>
<p>Create a custom hook when you find yourself copying the same logic between components. Common patterns include:</p>
<ul>
  <li>Fetching data from APIs</li>
  <li>Managing form state</li>
  <li>Handling subscriptions</li>
  <li>Implementing animations</li>
</ul>

<h3>Example: useLocalStorage</h3>
<pre><code>function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}</code></pre>

<p>This hook syncs state with localStorage automatically. Any component can use it to persist data across page reloads.</p>
        `,
        excerptEn: 'Learn how to create powerful custom hooks that simplify your components and share logic across your app.',
        descriptionEn: 'A deep dive into React custom hooks with practical examples and best practices.',
        isPremium: true,
        isPublished: true,
        status: 'PUBLISHED',
        publishedAt: new Date('2026-04-20'),
        viewCount: 142,
        likeCount: 28,
        sourceSite: 'CPKB',
        sourceAuthor: 'CPKB Team',
        categories: {
          connect: [{ id: categories[0].id }],
        },
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[1].id }],
        },
      },
    }),
    prisma.article.create({
      data: {
        slug: 'typescript-generics-mastery',
        titleEn: 'TypeScript Generics: From Basic to Advanced Patterns',
        contentEn: `
<h2>What Are Generics?</h2>
<p>Generics allow you to create reusable components that work with multiple types while maintaining type safety.</p>

<h3>Basic Generic Function</h3>
<pre><code>function identity<T>(arg: T): T {
  return arg;
}

// Usage
const result = identity<string>('hello');
const num = identity(42); // Type inference</code></pre>

<h3>Generic Constraints</h3>
<p>Use constraints to limit what types can be passed to a generic:</p>
<pre><code>interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}</code></pre>

<h3>Practical Examples</h3>
<p>Generics shine in API responses, form handling, and state management. Here's a typed API response pattern:</p>
<pre><code>type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json();
}</code></pre>
        `,
        excerptEn: 'Master TypeScript generics with practical examples from basic functions to advanced patterns.',
        descriptionEn: 'Complete guide to TypeScript generics with real-world examples.',
        isPremium: true,
        isPublished: true,
        status: 'PUBLISHED',
        publishedAt: new Date('2026-04-18'),
        viewCount: 98,
        likeCount: 19,
        sourceSite: 'CPKB',
        sourceAuthor: 'CPKB Team',
        categories: {
          connect: [{ id: categories[1].id }],
        },
        tags: {
          connect: [{ id: tags[2].id }],
        },
      },
    }),
    prisma.article.create({
      data: {
        slug: 'nextjs-15-server-components',
        titleEn: 'Next.js 15 Server Components: Complete Guide',
        contentEn: `
<h2>Server Components Explained</h2>
<p>Server Components render on the server and send HTML to the client. They can access databases, file systems, and other server-side resources directly.</p>

<h3>When to Use Server Components</h3>
<ul>
  <li>Fetching data from databases or APIs</li>
  <li>Accessing backend resources</li>
  <li>Reducing client-side JavaScript</li>
  <li>Improving initial page load performance</li>
</ul>

<h3>Client Components</h3>
<p>Use the <code>'use client'</code> directive when you need:</p>
<ul>
  <li>Interactivity (onClick, onChange)</li>
  <li>State management (useState, useReducer)</li>
  <li>Browser APIs (window, localStorage)</li>
  <li>Custom hooks with side effects</li>
</ul>

<h3>Best Practices</h3>
<p>Default to Server Components. Only use Client Components when necessary. This keeps your bundle size small and improves performance.</p>
        `,
        excerptEn: 'Learn how to leverage Next.js 15 Server Components for better performance and developer experience.',
        descriptionEn: 'Complete guide to Next.js 15 Server Components with best practices.',
        isPremium: false,
        isPublished: true,
        status: 'PUBLISHED',
        publishedAt: new Date('2026-04-15'),
        viewCount: 256,
        likeCount: 45,
        sourceSite: 'CPKB',
        sourceAuthor: 'CPKB Team',
        categories: {
          connect: [{ id: categories[2].id }],
        },
        tags: {
          connect: [{ id: tags[3].id }],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${articles.length} articles`);

  // Create a test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@cyberpunkkb.com',
      name: 'Test User',
      planType: 'FREE',
      subscriptionStatus: 'INACTIVE',
      role: 'USER',
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
