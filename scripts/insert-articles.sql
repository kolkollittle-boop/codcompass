-- ============================================
-- Codcompass 知识库文章插入脚本
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================

-- React Performance Optimization
INSERT INTO "Article" (slug, titleEn, contentEn, excerptEn, descriptionEn, isPremium, isPublished, publishedAt)
VALUES (
  'react-performance-optimization',
  'React Performance Optimization Guide',
  '<h2>Why Performance Matters</h2><p>In React applications, performance issues can manifest as slow rendering, janky animations, or delayed user interactions.</p><h2>1. Memoization with React.memo</h2><pre><code>const ExpensiveComponent = React.memo(({ data }) => { return <div>{/* rendering */}</div>; });</code></pre><h2>2. useMemo for Expensive Computations</h2><pre><code>const sortedData = useMemo(() => data.sort((a, b) => a.value - b.value), [data]);</code></pre><h2>3. Code Splitting</h2><pre><code>const HeavyChart = React.lazy(() => import(''./HeavyChart''));</code></pre>',
  'Master React performance optimization with proven techniques including memoization, code splitting, and virtualization.',
  'Complete guide to optimizing React applications for better performance and user experience.',
  true,
  true,
  NOW()
);

-- TypeScript Generics
INSERT INTO "Article" (slug, titleEn, contentEn, excerptEn, descriptionEn, isPremium, isPublished, publishedAt)
VALUES (
  'typescript-generics-deep-dive',
  'TypeScript Generics Deep Dive',
  '<h2>What Are Generics?</h2><p>Generics allow you to create reusable components that work with multiple types while maintaining type safety.</p><h2>Basic Generic Function</h2><pre><code>function identity<T>(arg: T): T { return arg; }</code></pre><h2>Generic Interfaces</h2><pre><code>interface Repository<T> { getById(id: string): Promise<T>; getAll(): Promise<T[]>; }</code></pre>',
  'Deep dive into TypeScript generics with constraints, conditional types, and mapped types.',
  'Master TypeScript generics for building reusable, type-safe components and functions.',
  true,
  true,
  NOW()
);

-- Next.js Server Components
INSERT INTO "Article" (slug, titleEn, contentEn, excerptEn, descriptionEn, isPremium, isPublished, publishedAt)
VALUES (
  'nextjs-server-components',
  'Next.js Server Components Explained',
  '<h2>What Are Server Components?</h2><p>React Server Components (RSC) allow components to run exclusively on the server, reducing bundle size.</p><h2>Default: Server Components</h2><p>In Next.js 13+, components are server components by default.</p><h2>When to Use "use client"</h2><p>Only use client components when you need useState, useEffect, or event handlers.</p>',
  'Learn how to use Next.js Server Components for better performance and developer experience.',
  'Complete guide to React Server Components in Next.js with best practices and patterns.',
  true,
  true,
  NOW()
);

-- Docker & Kubernetes
INSERT INTO "Article" (slug, titleEn, contentEn, excerptEn, descriptionEn, isPremium, isPublished, publishedAt)
VALUES (
  'docker-kubernetes-beginner',
  'Docker & Kubernetes for Beginners',
  '<h2>Why Containerization?</h2><p>Docker packages your application with all its dependencies into a standardized unit.</p><h2>Dockerfile Example</h2><pre><code>FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]</code></pre><h2>Kubernetes Deployment</h2><pre><code>apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: myapp\n        image: myapp:1.0</code></pre>',
  'Learn Docker and Kubernetes from scratch with practical examples and best practices.',
  'Beginner-friendly guide to containerization with Docker and orchestration with Kubernetes.',
  false,
  true,
  NOW()
);

-- AI Code Generation
INSERT INTO "Article" (slug, titleEn, contentEn, excerptEn, descriptionEn, isPremium, isPublished, publishedAt)
VALUES (
  'ai-code-generation-tools',
  'AI-Powered Code Generation Tools',
  '<h2>The AI Revolution in Development</h2><p>AI tools are transforming how developers write code.</p><h2>Popular Tools</h2><ul><li>GitHub Copilot - AI pair programmer</li><li>Claude Code - Coding assistant</li><li>Cursor - AI-first code editor</li></ul><h2>Best Practices</h2><ul><li>Use AI for boilerplate code</li><li>Review all AI-generated code</li><li>Keep sensitive code out of public AI tools</li></ul>',
  'Explore AI-powered coding tools and learn how to use them effectively in your workflow.',
  'Comprehensive guide to AI coding assistants including GitHub Copilot, Claude Code, and more.',
  true,
  true,
  NOW()
);

-- Link articles to categories (update category IDs as needed)
-- React article -> React category
INSERT INTO "ArticleToCategory" (articleId, categoryId)
SELECT a.id, c.id FROM "Article" a, "Category" c 
WHERE a.slug = ''react-performance-optimization'' AND c.slug = ''react''
ON CONFLICT DO NOTHING;

-- TypeScript article -> TypeScript category
INSERT INTO "ArticleToCategory" (articleId, categoryId)
SELECT a.id, c.id FROM "Article" a, "Category" c 
WHERE a.slug = ''typescript-generics-deep-dive'' AND c.slug = ''typescript''
ON CONFLICT DO NOTHING;

-- Next.js article -> Next.js category
INSERT INTO "ArticleToCategory" (articleId, categoryId)
SELECT a.id, c.id FROM "Article" a, "Category" c 
WHERE a.slug = ''nextjs-server-components'' AND c.slug = ''nextjs''
ON CONFLICT DO NOTHING;

-- DevOps article -> DevOps category (if exists, otherwise AI/ML)
INSERT INTO "ArticleToCategory" (articleId, categoryId)
SELECT a.id, c.id FROM "Article" a, "Category" c 
WHERE a.slug = ''docker-kubernetes-beginner'' AND c.slug = ''ai-ml''
ON CONFLICT DO NOTHING;

-- AI article -> AI/ML category
INSERT INTO "ArticleToCategory" (articleId, categoryId)
SELECT a.id, c.id FROM "Article" a, "Category" c 
WHERE a.slug = ''ai-code-generation-tools'' AND c.slug = ''ai-ml''
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT slug, titleEn, "isPublished", "isPremium" FROM "Article" ORDER BY "publishedAt" DESC;
