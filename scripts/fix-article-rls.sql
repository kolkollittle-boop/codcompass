-- ============================================
-- Complete RLS Fix for Articles
-- Allow public read + admin write
-- ============================================

-- 1. Drop ALL existing Article policies
DROP POLICY IF EXISTS "Public read published articles" ON "Article";
DROP POLICY IF EXISTS "Anyone can read published articles" ON "Article";
DROP POLICY IF EXISTS "Authenticated read all articles" ON "Article";
DROP POLICY IF EXISTS "Admins and editors can read all articles" ON "Article";
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON "Article";
DROP POLICY IF EXISTS "Admin manage articles" ON "Article";

-- Create new Article policies
-- Public can read published articles
CREATE POLICY "Public read published articles"
ON "Article" FOR SELECT
USING ("isPublished" = true);

-- Service role can do everything (for API)
CREATE POLICY "Service role full access"
ON "Article" FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Category table
DROP POLICY IF EXISTS "Anyone can read categories" ON "Category";
DROP POLICY IF EXISTS "Public read categories" ON "Category";
CREATE POLICY "Public read categories"
ON "Category" FOR SELECT
USING (true);

-- 3. Tag table
DROP POLICY IF EXISTS "Anyone can read tags" ON "Tag";
DROP POLICY IF EXISTS "Public read tags" ON "Tag";
CREATE POLICY "Public read tags"
ON "Tag" FOR SELECT
USING (true);

-- 4. _ArticleToCategory join table
DROP POLICY IF EXISTS "Public read article categories" ON "_ArticleToCategory";
CREATE POLICY "Public read article categories"
ON "_ArticleToCategory" FOR SELECT
USING (true);

-- 5. _ArticleToTag join table
DROP POLICY IF EXISTS "Public read article tags" ON "_ArticleToTag";
CREATE POLICY "Public read article tags"
ON "_ArticleToTag" FOR SELECT
USING (true);

-- Verify policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('Article', 'Category', 'Tag', '_ArticleToCategory', '_ArticleToTag')
ORDER BY tablename;

-- Test query
SELECT 
  a.slug, 
  a."titleEn", 
  a."isPublished",
  a."isPremium"
FROM "Article" a
WHERE a."isPublished" = true
ORDER BY a."publishedAt" DESC;
