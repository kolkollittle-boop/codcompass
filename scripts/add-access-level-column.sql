-- Add access_level column to Article table
-- This replaces the isPremium boolean with a more granular access level

-- Add the new column with default value 'free'
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "accessLevel" TEXT NOT NULL DEFAULT 'free';

-- Migrate existing data: isPremium = true -> accessLevel = 'pro'
-- This is a conservative migration - all premium content becomes Pro level
UPDATE "Article" SET "accessLevel" = 'pro' WHERE "isPremium" = true;

-- Optional: If you want to set some articles to 'builder' level, you can do it manually
-- For example, based on category or other criteria
-- UPDATE "Article" SET "accessLevel" = 'builder' WHERE ...;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "idx_article_access_level" ON "Article"("accessLevel");

-- Note: Keep isPremium column for backward compatibility
-- It can be removed later after all code is updated to use accessLevel
-- ALTER TABLE "Article" DROP COLUMN "isPremium";
