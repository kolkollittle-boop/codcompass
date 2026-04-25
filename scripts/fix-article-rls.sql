-- ============================================
-- Fix RLS Policies for Public Article Access
-- ============================================

-- 1. Fix Article table policies
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can read published articles" ON "Article";
DROP POLICY IF EXISTS "Admins and editors can read all articles" ON "Article";
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON "Article";

-- Create new policies
-- Public can read published articles (no auth required)
CREATE POLICY "Public read published articles"
ON "Article" FOR SELECT
USING ("isPublished" = true);

-- Authenticated users can read all articles
CREATE POLICY "Authenticated read all articles"
ON "Article" FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins can manage all articles
CREATE POLICY "Admin manage articles"
ON "Article" FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'::"UserRole"
  )
);

-- 2. Fix ArticleToCategory join table
DROP POLICY IF EXISTS "Public read article categories" ON "ArticleToCategory";
CREATE POLICY "Public read article categories"
ON "ArticleToCategory" FOR SELECT
USING (true);

-- 3. Fix Category table
DROP POLICY IF EXISTS "Anyone can read categories" ON "Category";
CREATE POLICY "Public read categories"
ON "Category" FOR SELECT
USING (true);

-- 4. Fix ArticleToTag join table
DROP POLICY IF EXISTS "Public read article tags" ON "ArticleToTag";
CREATE POLICY "Public read article tags"
ON "ArticleToTag" FOR SELECT
USING (true);

-- 5. Fix Tag table
DROP POLICY IF EXISTS "Anyone can read tags" ON "Tag";
CREATE POLICY "Public read tags"
ON "Tag" FOR SELECT
USING (true);

-- Verify policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('Article', 'ArticleToCategory', 'Category', 'ArticleToTag', 'Tag')
ORDER BY tablename, policyname;

-- Test query
SELECT 
  a.slug, 
  a.titleEn, 
  a.isPublished,
  c.name as category
FROM "Article" a
LEFT JOIN "ArticleToCategory" atc ON a.id = atc.articleId
LEFT JOIN "Category" c ON atc.categoryId = c.id
WHERE a."isPublished" = true
ORDER BY a."publishedAt" DESC;
