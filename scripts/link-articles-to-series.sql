-- Link articles to series based on slug keywords
-- Run this in Supabase SQL Editor

-- RAG Architecture Advanced
UPDATE "Article" 
SET "seriesId" = 'rag-architecture-advanced-001'
WHERE "seriesId" IS NULL 
  AND "isPublished" = true
  AND (
    LOWER("slug") LIKE '%rag%' OR
    LOWER("titleEn") LIKE '%rag%' OR
    LOWER("titleEn") LIKE '%retrieval%' OR
    LOWER("titleEn") LIKE '%embedding%' OR
    LOWER("titleEn") LIKE '%vector%' OR
    LOWER("titleEn") LIKE '%hybrid search%' OR
    LOWER("titleEn") LIKE '%rerank%' OR
    LOWER("titleEn") LIKE '%chunking%'
  );

-- AI Agent Development
UPDATE "Article" 
SET "seriesId" = '04f143c4-0f3f-4cd2-926b-03ad4ab44871'
WHERE "seriesId" IS NULL 
  AND "isPublished" = true
  AND (
    LOWER("slug") LIKE '%agent%' OR
    LOWER("titleEn") LIKE '%agent%' OR
    LOWER("titleEn") LIKE '%multi-agent%' OR
    LOWER("titleEn") LIKE '%autonomous%' OR
    LOWER("titleEn") LIKE '%tool use%' OR
    LOWER("titleEn") LIKE '%planning%' OR
    LOWER("titleEn") LIKE '%copilot%'
  );

-- Microservices Architecture
UPDATE "Article" 
SET "seriesId" = '477039e2-3917-4bb7-b8ed-5e5712b340a0'
WHERE "seriesId" IS NULL 
  AND "isPublished" = true
  AND (
    LOWER("slug") LIKE '%microservice%' OR
    LOWER("titleEn") LIKE '%microservice%' OR
    LOWER("titleEn") LIKE '%service mesh%' OR
    LOWER("titleEn") LIKE '%api gateway%' OR
    LOWER("titleEn") LIKE '%kubernetes%' OR
    LOWER("titleEn") LIKE '%docker%' OR
    LOWER("titleEn") LIKE '%deployment%'
  );

-- Full-Stack Performance Optimization
UPDATE "Article" 
SET "seriesId" = '8bec124a-71aa-47a8-a935-7f089eccdf27'
WHERE "seriesId" IS NULL 
  AND "isPublished" = true
  AND (
    LOWER("slug") LIKE '%performance%' OR
    LOWER("titleEn") LIKE '%performance%' OR
    LOWER("titleEn") LIKE '%optimization%' OR
    LOWER("titleEn") LIKE '%caching%' OR
    LOWER("titleEn") LIKE '%cdn%' OR
    LOWER("titleEn") LIKE '%scaling%'
  );

-- Verify results
SELECT 
  s.slug as series_slug,
  COUNT(a.id) as article_count
FROM "ArticleSeries" s
LEFT JOIN "Article" a ON a."seriesId" = s.id AND a."isPublished" = true
GROUP BY s.slug
ORDER BY article_count DESC;
