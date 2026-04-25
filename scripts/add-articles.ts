#!/usr/bin/env node
/**
 * 批量添加知识库文章到 Supabase
 * 
 * 用法：npx tsx scripts/add-articles.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekunyyscyqhasolbbohw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ 需要设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const articles = [
  {
    slug: 'react-performance-optimization',
    titleEn: 'React Performance Optimization Guide',
    contentEn: `
<h2>Why Performance Matters</h2>
<p>In React applications, performance issues can manifest as slow rendering, janky animations, or delayed user interactions. Let's explore proven optimization techniques.</p>

<h2>1. Memoization with React.memo</h2>
<p>React.memo prevents unnecessary re-renders by memoizing components:</p>
<pre><code>const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});</code></pre>

<h2>2. useMemo for Expensive Computations</h2>
<p>Cache expensive calculations to avoid recomputation:</p>
<pre><code>const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);</code></pre>

<h2>3. useCallback for Stable References</h2>
<p>Prevent unnecessary re-renders of child components:</p>
<pre><code>const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);</code></pre>

<h2>4. Code Splitting with React.lazy</h2>
<p>Load components only when needed:</p>
<pre><code>const HeavyChart = React.lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}</code></pre>

<h2>5. Virtualization for Long Lists</h2>
<p>Use react-window or react-virtualized to render only visible items:</p>
<pre><code>import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList></code></pre>

<h2>6. Avoid Inline Object Creation</h2>
<p>Create objects outside components or memoize them:</p>
<pre><code>// ❌ Bad - new object on every render
<div style={{ margin: 10 }}>Content</div>

// ✅ Good - constant reference
const containerStyle = { margin: 10 };
<div style={containerStyle}>Content</div></code></pre>

<h2>7. Use Production Build</h2>
<p>Always deploy with production mode for optimal performance:</p>
<pre><code>npm run build  # Creates optimized production bundle</code></pre>

<h2>Performance Checklist</h2>
<ul>
  <li>✅ Use React.memo for pure components</li>
  <li>✅ Memoize expensive computations with useMemo</li>
  <li>✅ Stabilize function references with useCallback</li>
  <li>✅ Code split heavy components</li>
  <li>✅ Virtualize long lists</li>
  <li>✅ Avoid inline object creation in JSX</li>
  <li>✅ Use production builds for deployment</li>
  <li>✅ Monitor with React DevTools Profiler</li>
</ul>
`,
    excerptEn: 'Master React performance optimization with proven techniques including memoization, code splitting, and virtualization.',
    descriptionEn: 'Complete guide to optimizing React applications for better performance and user experience.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'react',
  },
  {
    slug: 'typescript-generics-deep-dive',
    titleEn: 'TypeScript Generics Deep Dive',
    contentEn: `
<h2>What Are Generics?</h2>
<p>Generics allow you to create reusable components that work with multiple types while maintaining type safety.</p>

<h2>Basic Generic Function</h2>
<pre><code>function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>('hello');  // T is string
const num = identity(42);  // T inferred as number</code></pre>

<h2>Generic Interfaces</h2>
<pre><code>interface Repository<T> {
  getById(id: string): Promise<T>;
  getAll(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const userRepo: Repository<User> = { /* implementation */ };</code></pre>

<h2>Generic Constraints</h2>
<p>Restrict what types can be used with generics:</p>
<pre><code>interface HasId {
  id: string;
}

function getId<T extends HasId>(item: T): string {
  return item.id;
}

// ✅ Valid
const user = { id: '123', name: 'John' };
getId(user);

// ❌ Error - doesn't have id property
getId({ name: 'John' });</code></pre>

<h2>Generic Type Aliases</h2>
<pre><code>type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

type ApiResponse<T> = {
  status: number;
  data: T;
  message: string;
};</code></pre>

<h2>Advanced: Conditional Types</h2>
<pre><code>type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false</code></pre>

<h2>Advanced: Mapped Types</h2>
<pre><code>type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};</code></pre>

<h2>Best Practices</h2>
<ul>
  <li>✅ Use generics for reusable, type-safe components</li>
  <li>✅ Add constraints when you need specific properties</li>
  <li>✅ Provide default type parameters when appropriate</li>
  <li>✅ Use inference to reduce verbosity</li>
  <li>❌ Don't overuse generics - keep it simple</li>
</ul>
`,
    excerptEn: 'Deep dive into TypeScript generics with constraints, conditional types, and mapped types.',
    descriptionEn: 'Master TypeScript generics for building reusable, type-safe components and functions.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'typescript',
  },
  {
    slug: 'nextjs-server-components',
    titleEn: 'Next.js Server Components Explained',
    contentEn: `
<h2>What Are Server Components?</h2>
<p>React Server Components (RSC) allow components to run exclusively on the server, reducing bundle size and improving performance.</p>

<h2>Default: Server Components</h2>
<p>In Next.js 13+, components are server components by default:</p>
<pre><code>// This is a Server Component
export default async function UserProfile({ id }) {
  const user = await db.user.findUnique({ where: { id } });
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}</code></pre>

<h2>When to Use "use client"</h2>
<p>Only use client components when you need:</p>
<ul>
  <li>useState, useEffect, or other hooks</li>
  <li>Event handlers (onClick, onChange)</li>
  <li>Browser APIs (window, localStorage)</li>
  <li>Class components</li>
</ul>

<pre><code>'use client';

export function SearchBar() {
  const [query, setQuery] = useState('');
  
  return (
    <input 
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}</code></pre>

<h2>Server Component Benefits</h2>
<ul>
  <li>✅ Zero bundle size impact</li>
  <li>✅ Direct database access</li>
  <li>✅ No API layer needed</li>
  <li>✅ Automatic code splitting</li>
  <li>✅ Streaming support</li>
</ul>

<h2>Composition Patterns</h2>
<pre><code>// Server Component
export default async function Page() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      {/* Pass data to client component */}
      <InteractiveChart data={data.chart} />
    </div>
  );
}

// Client Component
'use client';
export function InteractiveChart({ data }) {
  return <Chart data={data} />;
}</code></pre>

<h2>Best Practices</h2>
<ul>
  <li>✅ Default to Server Components</li>
  <li>✅ Use "use client" only when necessary</li>
  <li>✅ Fetch data in Server Components</li>
  <li>✅ Keep client components small</li>
  <li>✅ Use Suspense for loading states</li>
</ul>
`,
    excerptEn: 'Learn how to use Next.js Server Components for better performance and developer experience.',
    descriptionEn: 'Complete guide to React Server Components in Next.js with best practices and patterns.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'nextjs',
  },
  {
    slug: 'docker-kubernetes-beginner',
    titleEn: 'Docker & Kubernetes for Beginners',
    contentEn: `
<h2>Why Containerization?</h2>
<p>Docker packages your application with all its dependencies into a standardized unit, ensuring consistency across environments.</p>

<h2>Docker Basics</h2>
<h3>Dockerfile Example</h3>
<pre><code># Use official Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]</code></pre>

<h3>Build and Run</h3>
<pre><code># Build image
docker build -t myapp:1.0 .

# Run container
docker run -p 3000:3000 myapp:1.0

# Run in background
docker run -d -p 3000:3000 myapp:1.0</code></pre>

<h2>Docker Compose</h2>
<p>Define multi-container applications:</p>
<pre><code>version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:</code></pre>

<h2>Kubernetes Basics</h2>
<h3>Pod Definition</h3>
<pre><code>apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    ports:
    - containerPort: 3000</code></pre>

<h3>Deployment</h3>
<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        ports:
        - containerPort: 3000</code></pre>

<h3>Service</h3>
<pre><code>apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer</code></pre>

<h2>Best Practices</h2>
<ul>
  <li>✅ Use multi-stage builds for smaller images</li>
  <li>✅ Don't run containers as root</li>
  <li>✅ Use .dockerignore to exclude files</li>
  <li>✅ Pin image versions</li>
  <li>✅ Use health checks</li>
  <li>✅ Set resource limits in Kubernetes</li>
</ul>
`,
    excerptEn: 'Learn Docker and Kubernetes from scratch with practical examples and best practices.',
    descriptionEn: 'Beginner-friendly guide to containerization with Docker and orchestration with Kubernetes.',
    isPremium: false,
    isPublished: true,
    categorySlug: 'devops',
  },
  {
    slug: 'ai-code-generation-tools',
    titleEn: 'AI-Powered Code Generation Tools',
    contentEn: `
<h2>The AI Revolution in Development</h2>
<p>AI tools are transforming how developers write code, from autocomplete to full feature generation. Let's explore the landscape.</p>

<h2>Popular AI Coding Tools</h2>
<ul>
  <li><strong>GitHub Copilot:</strong> AI pair programmer by GitHub/OpenAI</li>
  <li><strong>Claude Code:</strong> Anthropic's coding assistant</li>
  <li><strong>Cursor:</strong> AI-first code editor</li>
  <li><strong>Tabnine:</strong> AI code completion</li>
  <li><strong>Amazon CodeWhisperer:</strong> AWS's AI coding assistant</li>
</ul>

<h2>GitHub Copilot</h2>
<p>Best for: Real-time code suggestions in your editor</p>
<pre><code>// Example: Copilot suggests the entire function
// Create a function to validate email addresses
function validateEmail(email) {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}</code></pre>

<h2>Claude Code</h2>
<p>Best for: Complex refactoring and code review</p>
<pre><code>// Claude can understand your entire codebase
// and suggest architectural improvements

// Example prompt: "Refactor this component to use hooks"
// Claude will analyze the component and provide
// a complete refactored version</code></pre>

<h2>Best Practices for AI-Assisted Development</h2>
<ul>
  <li>✅ Use AI for boilerplate and repetitive code</li>
  <li>✅ Review all AI-generated code carefully</li>
  <li>✅ Don't blindly trust AI suggestions</li>
  <li>✅ Use AI for learning new patterns</li>
  <li>✅ Keep sensitive code out of public AI tools</li>
  <li>✅ Combine AI with traditional testing</li>
</ul>

<h2>Limitations</h2>
<ul>
  <li>❌ AI can generate insecure code</li>
  <li>❌ May not understand business context</li>
  <li>❌ Can introduce subtle bugs</li>
  <li>❌ License concerns with generated code</li>
</ul>

<h2>Future Trends</h2>
<ul>
  <li>🔮 AI-generated tests from requirements</li>
  <li>🔮 Automated code review</li>
  <li>🔮 Natural language to full applications</li>
  <li>🔮 AI-assisted debugging</li>
</ul>
`,
    excerptEn: 'Explore AI-powered coding tools and learn how to use them effectively in your workflow.',
    descriptionEn: 'Comprehensive guide to AI coding assistants including GitHub Copilot, Claude Code, and more.',
    isPremium: true,
    isPublished: true,
    categorySlug: 'ai-ml',
  },
];

async function main() {
  console.log('📝 Adding articles to database...');

  // First, get category IDs
  const { data: categories } = await supabase
    .from('Category')
    .select('slug, id');

  const categoryMap: Record<string, string> = {};
  categories?.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  for (const article of articles) {
    console.log(`\n📄 Processing: ${article.titleEn}`);

    // Check if article already exists
    const { data: existing } = await supabase
      .from('Article')
      .select('id')
      .eq('slug', article.slug)
      .single();

    if (existing) {
      console.log(`  ⏭️  Already exists, skipping...`);
      continue;
    }

    // Create article
    const { data: newArticle, error } = await supabase
      .from('Article')
      .insert({
        slug: article.slug,
        titleEn: article.titleEn,
        contentEn: article.contentEn,
        excerptEn: article.excerptEn,
        descriptionEn: article.descriptionEn,
        isPremium: article.isPremium,
        isPublished: article.isPublished,
        publishedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error creating article: ${error.message}`);
      continue;
    }

    console.log(`  ✅ Created article: ${newArticle.id}`);

    // Link to category
    const categoryId = categoryMap[article.categorySlug];
    if (categoryId) {
      await supabase
        .from('ArticleToCategory')
        .insert({
          articleId: newArticle.id,
          categoryId: categoryId,
        });
      console.log(`  🔗 Linked to category: ${article.categorySlug}`);
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
