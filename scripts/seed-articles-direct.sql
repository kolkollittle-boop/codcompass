-- ============================================
-- 直接通过 SQL 添加文章（绕过 API）
-- ============================================

-- 1. 添加 5 篇文章
INSERT INTO "Article" ("id", "slug", "titleEn", "contentEn", "excerptEn", "descriptionEn", "isPremium", "isPublished", "publishedAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'react-hooks-deep-dive', 'React Hooks Deep Dive', '<h2>Introduction to React Hooks</h2><p>React Hooks were introduced in React 16.8 and fundamentally changed how we write React components. They allow you to use state and other React features without writing a class.</p><h2>useState Hook</h2><p>The useState hook is the most basic hook. It lets you add state to functional components:</p><pre><code>const [count, setCount] = useState(0);</code></pre><h2>useEffect Hook</h2><p>useEffect lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.</p><h2>Custom Hooks</h2><p>Custom Hooks let you extract component logic into reusable functions. A custom Hook is a JavaScript function whose name starts with "use" and that may call other Hooks.</p>', 'Master React Hooks including useState, useEffect, and custom hooks with practical examples.', 'Complete guide to React Hooks with deep dive into useState, useEffect, useContext, and creating custom hooks.', true, true, NOW(), NOW()),
  
  (gen_random_uuid()::text, 'typescript-generics-mastery', 'TypeScript Generics: From Basic to Advanced', '<h2>What are Generics?</h2><p>Generics provide a way to create reusable components that work with any data type. They allow you to write a function or class that works with multiple types while preserving type safety.</p><h2>Generic Functions</h2><pre><code>function identity<T>(arg: T): T { return arg; }</code></pre><h2>Generic Constraints</h2><p>You can use extends to constrain the types that can be used with a generic:</p><pre><code>interface HasLength { length: number; } function logLength<T extends HasLength>(arg: T): void { console.log(arg.length); }</code></pre><h2>Advanced Patterns</h2><p>Learn about conditional types, mapped types, and template literal types for advanced TypeScript programming.</p>', 'Master TypeScript generics from basics to advanced patterns including constraints and conditional types.', 'Complete guide to TypeScript generics with practical examples and advanced patterns.', true, true, NOW(), NOW()),
  
  (gen_random_uuid()::text, 'nextjs-15-server-components', 'Next.js 15 Server Components: Complete Guide', '<h2>What are Server Components?</h2><p>React Server Components allow you to write UI that can be rendered on the server. They reduce the amount of JavaScript sent to the client and improve performance.</p><h2>Key Benefits</h2><ul><li>Zero bundle size for server components</li><li>Direct access to backend resources</li><li>Automatic code splitting</li><li>Improved initial page load</li></ul><h2>Best Practices</h2><p>Learn when to use Server Components vs Client Components, how to handle interactivity, and how to optimize your Next.js 15 applications.</p>', 'Learn Next.js 15 Server Components with practical examples and best practices.', 'Complete guide to Next.js 15 Server Components with performance optimization tips.', false, true, NOW(), NOW()),
  
  (gen_random_uuid()::text, 'ai-code-generation-tools', 'AI-Powered Code Generation Tools', '<h2>The AI Revolution in Development</h2><p>AI-powered tools are transforming how developers write code. From autocomplete to full function generation, these tools can significantly boost productivity.</p><h2>Popular Tools</h2><ul><li><strong>GitHub Copilot</strong> - AI pair programmer</li><li><strong>Claude Code</strong> - Coding assistant</li><li><strong>Cursor</strong> - AI-first code editor</li></ul><h2>Best Practices</h2><p>Learn how to effectively use AI coding assistants while maintaining code quality and security.</p>', 'Explore AI-powered coding tools and learn how to use them effectively in your workflow.', 'Complete guide to AI coding assistants including GitHub Copilot, Claude Code, and more.', true, true, NOW(), NOW()),
  
  (gen_random_uuid()::text, 'docker-kubernetes-beginner', 'Docker & Kubernetes for Beginners', '<h2>Why Containerization?</h2><p>Containers solve the "it works on my machine" problem by packaging your application with all its dependencies into a standardized unit.</p><h2>Docker Basics</h2><pre><code>FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]</code></pre><h2>Kubernetes Fundamentals</h2><p>Learn about Pods, Deployments, Services, and how to orchestrate containers at scale.</p>', 'Learn Docker and Kubernetes from scratch with practical examples and best practices.', 'Beginner-friendly guide to containerization with Docker and orchestration with Kubernetes.', false, true, NOW(), NOW());

-- 2. 获取分类 ID 并关联文章
-- React 分类
INSERT INTO "_ArticleToCategory" ("A", "B")
SELECT 
  (SELECT id FROM "Article" WHERE slug = 'react-hooks-deep-dive'),
  id
FROM "Category" 
WHERE slug = 'react'
ON CONFLICT DO NOTHING;

-- TypeScript 分类
INSERT INTO "_ArticleToCategory" ("A", "B")
SELECT 
  (SELECT id FROM "Article" WHERE slug = 'typescript-generics-mastery'),
  id
FROM "Category" 
WHERE slug = 'typescript'
ON CONFLICT DO NOTHING;

-- Next.js 分类
INSERT INTO "_ArticleToCategory" ("A", "B")
SELECT 
  (SELECT id FROM "Article" WHERE slug = 'nextjs-15-server-components'),
  id
FROM "Category" 
WHERE slug = 'nextjs'
ON CONFLICT DO NOTHING;

-- AI/ML 分类
INSERT INTO "_ArticleToCategory" ("A", "B")
SELECT 
  (SELECT id FROM "Article" WHERE slug = 'ai-code-generation-tools'),
  id
FROM "Category" 
WHERE slug = 'ai-ml'
ON CONFLICT DO NOTHING;

-- DevOps 分类（如果没有则关联到 AI/ML）
INSERT INTO "_ArticleToCategory" ("A", "B")
SELECT 
  (SELECT id FROM "Article" WHERE slug = 'docker-kubernetes-beginner'),
  COALESCE(
    (SELECT id FROM "Category" WHERE slug = 'devops'),
    (SELECT id FROM "Category" WHERE slug = 'ai-ml')
  )
ON CONFLICT DO NOTHING;

-- 3. 验证
SELECT 
  a.slug, 
  a."titleEn", 
  a."isPublished",
  a."isPremium",
  STRING_AGG(c.name, ', ') as categories
FROM "Article" a
LEFT JOIN "_ArticleToCategory" atc ON a.id = atc."A"
LEFT JOIN "Category" c ON atc."B" = c.id
WHERE a."isPublished" = true
GROUP BY a.id, a.slug, a."titleEn", a."isPublished", a."isPremium"
ORDER BY a."publishedAt" DESC;
