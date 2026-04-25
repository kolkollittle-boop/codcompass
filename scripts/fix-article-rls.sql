-- ============================================
-- Fix RLS Policies for Public Article Access
-- Complete rebuild of all policies
-- ============================================

-- 1. Drop ALL existing Article policies first
DROP POLICY IF EXISTS "Public read published articles" ON "Article";
DROP POLICY IF EXISTS "Anyone can read published articles" ON "Article";
DROP POLICY IF EXISTS "Authenticated read all articles" ON "Article";
DROP POLICY IF EXISTS "Admins and editors can read all articles" ON "Article";
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON "Article";
DROP POLICY IF EXISTS "Admin manage articles" ON "Article";

-- Create new Article policies
CREATE POLICY "Public read published articles"
ON "Article" FOR SELECT
USING ("isPublished" = true);

CREATE POLICY "Authenticated read all articles"
ON "Article" FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manage articles"
ON "Article" FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'::"UserRole"
  )
);

-- 2. Drop and recreate Category policies
DROP POLICY IF EXISTS "Anyone can read categories" ON "Category";
DROP POLICY IF EXISTS "Public read categories" ON "Category";

CREATE POLICY "Public read categories"
ON "Category" FOR SELECT
USING (true);

-- 3. Drop and recreate Tag policies
DROP POLICY IF EXISTS "Anyone can read tags" ON "Tag";
DROP POLICY IF EXISTS "Public read tags" ON "Tag";

CREATE POLICY "Public read tags"
ON "Tag" FOR SELECT
USING (true);

-- 4. Drop and recreate _ArticleToCategory policies
DROP POLICY IF EXISTS "Public read article categories" ON "_ArticleToCategory";

CREATE POLICY "Public read article categories"
ON "_ArticleToCategory" FOR SELECT
USING (true);

-- 5. Drop and recreate _ArticleToTag policies
DROP POLICY IF EXISTS "Public read article tags" ON "_ArticleToTag";

CREATE POLICY "Public read article tags"
ON "_ArticleToTag" FOR SELECT
USING (true);

-- 6. Verify all policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('Article', 'Category', 'Tag', '_ArticleToCategory', '_ArticleToTag')
ORDER BY tablename;

-- 7. Test query - should return all 8 published articles
SELECT 
  a.slug, 
  a."titleEn", 
  a."isPublished",
  a."isPremium",
  STRING_AGG(c.name, ', ') as categories
FROM "Article" a
LEFT JOIN "_ArticleToCategory" atc ON a.id = atc."A"
LEFT JOIN "Category" c ON atc."B" = c.id
WHERE a."isPublished" = true
GROUP BY a.id, a.slug, a."titleEn", a."isPublished", a."isPremium"
ORDER BY a."publishedAt" DESC;
