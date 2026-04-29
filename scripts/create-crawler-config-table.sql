-- 创建 CrawlerConfig 表
CREATE TABLE IF NOT EXISTS "CrawlerConfig" (
  "id" TEXT NOT NULL DEFAULT 'cm' || replace(gen_random_uuid()::text, '-', ''),
  "schedule" TEXT NOT NULL DEFAULT '0 * * * *',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sources" JSONB NOT NULL DEFAULT '[]',
  "translateContent" BOOLEAN NOT NULL DEFAULT true,
  "translateTargetLanguages" JSONB NOT NULL DEFAULT '["zh"]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "CrawlerConfig_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "CrawlerConfig_enabled_idx" ON "CrawlerConfig"("enabled");
