-- Add sample series data for Learning Paths section
-- Run this in Supabase SQL Editor

-- Series 1: RAG Architecture Advanced (already exists, just update if needed)
INSERT INTO "ArticleSeries" (id, slug, title, titleEn, description, totalParts, estimatedTime, "order", "isPublished", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'rag-architecture-advanced',
  'RAG 架构进阶',
  'RAG Architecture Advanced',
  'From local Ollama to vLLM cloud deployment, master the complete path to building production-grade RAG systems',
  12,
  120,
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  titleEn = EXCLUDED.titleEn,
  description = EXCLUDED.description,
  "isPublished" = true;

-- Series 2: AI Agent Development
INSERT INTO "ArticleSeries" (id, slug, title, titleEn, description, totalParts, estimatedTime, "order", "isPublished", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'ai-agent-development',
  'AI Agent 开发实战',
  'AI Agent Development',
  'Build production-ready AI agents with LangChain, AutoGen, and CrewAI frameworks',
  10,
  100,
  2,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Series 3: Microservices Architecture
INSERT INTO "ArticleSeries" (id, slug, title, titleEn, description, totalParts, estimatedTime, "order", "isPublished", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'microservices-architecture',
  '微服务架构设计',
  'Microservices Architecture',
  'Design and deploy scalable microservices with Docker, Kubernetes, and service mesh',
  8,
  80,
  3,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Series 4: Full-Stack Performance Optimization
INSERT INTO "ArticleSeries" (id, slug, title, titleEn, description, totalParts, estimatedTime, "order", "isPublished", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'fullstack-performance',
  '全栈性能优化',
  'Full-Stack Performance Optimization',
  'Optimize frontend, backend, and database for maximum performance and user experience',
  10,
  90,
  4,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
