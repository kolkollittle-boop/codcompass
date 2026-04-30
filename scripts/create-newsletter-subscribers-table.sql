-- NewsletterSubscriber 表
CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  "subscribedAt" TEXT NOT NULL DEFAULT (NOW()::text),
  "unsubscribedAt" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON "NewsletterSubscriber"(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON "NewsletterSubscriber"(status);

-- 启用 RLS
ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;

-- 允许任何人订阅（插入）
CREATE POLICY "Anyone can subscribe to newsletter" ON "NewsletterSubscriber"
  FOR INSERT WITH CHECK (true);

-- 只有管理员可以查看订阅者列表
CREATE POLICY "Admins can view newsletter subscribers" ON "NewsletterSubscriber"
  FOR SELECT USING (auth.role() = 'service_role');

-- 允许管理员更新
CREATE POLICY "Admins can update newsletter subscribers" ON "NewsletterSubscriber"
  FOR UPDATE USING (auth.role() = 'service_role');

-- 允许管理员删除
CREATE POLICY "Admins can delete newsletter subscribers" ON "NewsletterSubscriber"
  FOR DELETE USING (auth.role() = 'service_role');
