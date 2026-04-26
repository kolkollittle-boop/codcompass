-- ============================================
-- Codcompass - Category Seed Data
-- 10 Categories for Developer Knowledge Base
-- ============================================

-- Insert categories (upsert by slug)
INSERT INTO "Category" (id, slug, name, nameEn, description, "order") VALUES
  ('cat-ai-tools', 'ai-tools', 'AI 工具', 'AI Tools', 'AI application tools: ChatGPT, Claude, Midjourney, Copilot, and more', 1),
  ('cat-llm', 'llm', 'LLM 技术', 'LLM Technology', 'Large language models: Prompt Engineering, RAG, Fine-tuning, Agents', 2),
  ('cat-database', 'database', '数据库', 'Database', 'PostgreSQL, Redis, MongoDB, Supabase, and data management', 3),
  ('cat-api', 'api', 'API 开发', 'API Development', 'REST, GraphQL, tRPC, authentication, rate limiting, API design', 4),
  ('cat-frontend', 'frontend', '前端框架', 'Frontend', 'React, Next.js, Vue, Svelte, and modern web development', 5),
  ('cat-backend', 'backend', '后端技术', 'Backend', 'Node.js, Go, Rust, microservices, and server architecture', 6),
  ('cat-devops', 'devops', 'DevOps', 'DevOps', 'Docker, Kubernetes, CI/CD, deployment, and infrastructure', 7),
  ('cat-mobile', 'mobile', '移动开发', 'Mobile Development', 'React Native, Flutter, Swift, and cross-platform apps', 8),
  ('cat-security', 'security', '安全', 'Security', 'Authentication, encryption, penetration testing, and secure coding', 9),
  ('cat-product', 'product', '产品/创业', 'Product & Startup', 'SaaS, growth, monetization, indie hacking, and entrepreneurship', 10)
ON CONFLICT ("slug") DO UPDATE SET
  name = EXCLUDED.name,
  "nameEn" = EXCLUDED."nameEn",
  description = EXCLUDED.description,
  "order" = EXCLUDED."order";

-- Verify
SELECT slug, "nameEn", description FROM "Category" ORDER BY "order";
