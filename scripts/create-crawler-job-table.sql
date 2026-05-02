-- 爬虫「立即运行」队列表：仅记录派发结果，实际执行在 GitHub Actions / 外部 worker
CREATE TABLE IF NOT EXISTS "CrawlerJob" (
  "id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "triggerSource" TEXT NOT NULL DEFAULT 'admin',
  "dispatchTarget" TEXT,
  "githubRunUrl" TEXT,
  "githubRunId" TEXT,
  "errorMessage" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrawlerJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CrawlerJob_status_idx" ON "CrawlerJob"("status");
CREATE INDEX IF NOT EXISTS "CrawlerJob_createdAt_idx" ON "CrawlerJob"("createdAt");
