-- Update series descriptions from Chinese to English
-- Run this in Supabase SQL Editor

-- RAG Architecture Advanced series
UPDATE "ArticleSeries"
SET description = 'From local Ollama to vLLM cloud deployment, master the complete path to building production-grade RAG systems'
WHERE slug = 'rag-architecture-advanced'
  AND description LIKE '%Ollama%';

-- Add more series updates here as needed
-- Example:
-- UPDATE "ArticleSeries"
-- SET description = 'English description here'
-- WHERE slug = 'series-slug'
--   AND description IS NOT NULL;
