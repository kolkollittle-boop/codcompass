-- ============================================
-- CyberPunk Knowledge Base - RLS 策略
-- 日期: 2026-04-24
-- ============================================

-- ============================================
-- 1. User 表
-- ============================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的资料
CREATE POLICY "Users can read own profile"
ON "User" FOR SELECT
USING (id = auth.uid()::text);

-- 管理员可以读取所有用户
CREATE POLICY "Admins can read all users"
ON "User" FOR SELECT
USING (role = 'ADMIN'::"UserRole");

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile"
ON "User" FOR UPDATE
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- 管理员可以管理所有用户
CREATE POLICY "Admins can manage users"
ON "User" FOR ALL
USING (role = 'ADMIN'::"UserRole");

-- 允许注册时创建用户（NextAuth 需要）
CREATE POLICY "Allow user creation"
ON "User" FOR INSERT
WITH CHECK (true);

-- ============================================
-- 2. Account 表 (OAuth)
-- ============================================
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- 用户只能看自己的 OAuth 账号
CREATE POLICY "Users can read own accounts"
ON "Account" FOR SELECT
USING (userId = auth.uid()::text);

-- 用户可以管理自己的 OAuth 账号
CREATE POLICY "Users can manage own accounts"
ON "Account" FOR ALL
USING (userId = auth.uid()::text);

-- 允许创建（OAuth 登录时需要）
CREATE POLICY "Allow account creation"
ON "Account" FOR INSERT
WITH CHECK (userId = auth.uid()::text);

-- ============================================
-- 3. Subscription 表
-- ============================================
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- 用户只能看自己的订阅
CREATE POLICY "Users can read own subscriptions"
ON "Subscription" FOR SELECT
USING (userId = auth.uid()::text);

-- 管理员可以查看所有订阅
CREATE POLICY "Admins can read all subscriptions"
ON "Subscription" FOR SELECT
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- 管理员可以管理所有订阅（Webhook 写入）
CREATE POLICY "Admins can manage subscriptions"
ON "Subscription" FOR ALL
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- ============================================
-- 4. Article 表
-- ============================================
ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;

-- 所有人可以阅读已发布的文章（含未登录）
CREATE POLICY "Anyone can read published articles"
ON "Article" FOR SELECT
USING ("isPublished" = true);

-- 管理员/编辑可以阅读所有文章（含草稿）
CREATE POLICY "Admins and editors can read all articles"
ON "Article" FOR SELECT
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN'::"UserRole", 'EDITOR'::"UserRole")
));

-- 管理员/编辑可以管理文章
CREATE POLICY "Admins and editors can manage articles"
ON "Article" FOR ALL
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN'::"UserRole", 'EDITOR'::"UserRole")
));

-- ============================================
-- 5. ArticleTranslation 表
-- ============================================
ALTER TABLE "ArticleTranslation" ENABLE ROW LEVEL SECURITY;

-- 所有人可以阅读已发布文章的翻译
CREATE POLICY "Anyone can read published translations"
ON "ArticleTranslation" FOR SELECT
USING (EXISTS (
  SELECT 1 FROM "Article" WHERE "Article".id = "ArticleTranslation"."articleId" AND "Article"."isPublished" = true
));

-- 管理员/编辑可以管理所有翻译
CREATE POLICY "Admins and editors can manage translations"
ON "ArticleTranslation" FOR ALL
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN'::"UserRole", 'EDITOR'::"UserRole")
));

-- ============================================
-- 6. Category 表
-- ============================================
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

-- 所有人可以阅读分类
CREATE POLICY "Anyone can read categories"
ON "Category" FOR SELECT
USING (true);

-- 管理员可以管理分类
CREATE POLICY "Admins can manage categories"
ON "Category" FOR ALL
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- ============================================
-- 7. Tag 表
-- ============================================
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

-- 所有人可以阅读标签
CREATE POLICY "Anyone can read tags"
ON "Tag" FOR SELECT
USING (true);

-- 管理员可以管理标签
CREATE POLICY "Admins can manage tags"
ON "Tag" FOR ALL
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- ============================================
-- 8. ArticleView 表
-- ============================================
ALTER TABLE "ArticleView" ENABLE ROW LEVEL SECURITY;

-- 用户只能看自己的浏览记录
CREATE POLICY "Users can read own views"
ON "ArticleView" FOR SELECT
USING ("userId" = auth.uid()::text);

-- 任何人都可以创建浏览记录（用于统计）
CREATE POLICY "Anyone can create views"
ON "ArticleView" FOR INSERT
WITH CHECK (true);

-- 管理员可以查看所有浏览记录
CREATE POLICY "Admins can read all views"
ON "ArticleView" FOR SELECT
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- ============================================
-- 9. Bookmark 表
-- ============================================
ALTER TABLE "Bookmark" ENABLE ROW LEVEL SECURITY;

-- 用户只能管理自己的书签
CREATE POLICY "Users can manage own bookmarks"
ON "Bookmark" FOR ALL
USING ("userId" = auth.uid()::text);

-- ============================================
-- 10. TranslationFeedback 表
-- ============================================
ALTER TABLE "TranslationFeedback" ENABLE ROW LEVEL SECURITY;

-- 登录用户可以创建反馈
CREATE POLICY "Authenticated users can create feedback"
ON "TranslationFeedback" FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND "userId" = auth.uid()::text);

-- 用户可以看到自己的反馈
CREATE POLICY "Users can read own feedback"
ON "TranslationFeedback" FOR SELECT
USING ("userId" = auth.uid()::text);

-- 管理员可以查看所有反馈
CREATE POLICY "Admins can read all feedback"
ON "TranslationFeedback" FOR SELECT
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- 管理员可以管理所有反馈
CREATE POLICY "Admins can manage feedback"
ON "TranslationFeedback" FOR ALL
USING (EXISTS (
  SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"
));

-- ============================================
-- 完成
-- ============================================
