-- Codcompass 2.0 数据库迁移脚本
-- 为 Article 表添加 2.0 改版所需的新字段

-- 1. 添加 Article 新字段
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "difficultyLevel" VARCHAR;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "readingTime" INTEGER;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "expectedOutcome" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "seriesId" VARCHAR;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "seriesOrder" INTEGER;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "blueprintUrl" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "blueprintName" VARCHAR;

-- 2. 创建 ArticleSeries 表（专题路径）
CREATE TABLE IF NOT EXISTS "ArticleSeries" (
    "id" VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::VARCHAR(36),
    "slug" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "titleEn" VARCHAR NOT NULL,
    "description" TEXT,
    "totalParts" INTEGER NOT NULL DEFAULT 1,
    "estimatedTime" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArticleSeries_pkey" PRIMARY KEY ("id")
);

-- 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS "ArticleSeries_slug_key" ON "ArticleSeries"("slug");

-- 创建普通索引
CREATE INDEX IF NOT EXISTS "ArticleSeries_isPublished_idx" ON "ArticleSeries"("isPublished");
CREATE INDEX IF NOT EXISTS "ArticleSeries_order_idx" ON "ArticleSeries"("order");

-- 3. 添加外键约束
ALTER TABLE "Article" ADD CONSTRAINT "Article_seriesId_fkey" 
    FOREIGN KEY ("seriesId") REFERENCES "ArticleSeries"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. 添加索引
CREATE INDEX IF NOT EXISTS "Article_seriesId_idx" ON "Article"("seriesId");
CREATE INDEX IF NOT EXISTS "Article_difficultyLevel_idx" ON "Article"("difficultyLevel");

-- 5. 插入样板间专题数据（RAG 架构进阶系列）
INSERT INTO "ArticleSeries" ("id", "slug", "title", "titleEn", "description", "totalParts", "estimatedTime", "order", "isPublished")
VALUES (
    'rag-architecture-advanced-001',
    'rag-architecture-advanced',
    'RAG 架构进阶系列',
    'RAG Architecture Advanced Series',
    '从本地 Ollama 到 vLLM 云端部署，掌握生产级 RAG 系统的完整构建路径',
    7,
    120,
    1,
    true
) ON CONFLICT ("slug") DO NOTHING;
