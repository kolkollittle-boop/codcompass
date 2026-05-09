-- Migration to add isFeatured column to Articles and BlogPosts tables
-- This migration adds the isFeatured boolean field to support featured article designation

-- Add isFeatured column to Article table
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT FALSE;

-- Add isFeatured column to BlogPost table
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT FALSE;

-- Update existing articles with scores >= 80 to be featured
UPDATE "Article"
SET "isFeatured" = TRUE
WHERE "qualityScore" >= 80
AND "isFeatured" IS NOT TRUE;

-- Update existing blog posts with scores >= 80 to be featured (if score info available in qualityDetails)
-- For existing entries we'll set to FALSE by default and let new ingestions handle it properly