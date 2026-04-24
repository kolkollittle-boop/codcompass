// Apply RLS policies via Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const policies = [
  // User
  'ALTER TABLE "User" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Users can read own profile" ON "User" FOR SELECT USING (id = auth.uid()::text)`,
  `CREATE POLICY "Admins can read all users" ON "User" FOR SELECT USING (role = 'ADMIN'::"UserRole")`,
  `CREATE POLICY "Users can update own profile" ON "User" FOR UPDATE USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text)`,
  `CREATE POLICY "Admins can manage users" ON "User" FOR ALL USING (role = 'ADMIN'::"UserRole")`,
  `CREATE POLICY "Allow user creation" ON "User" FOR INSERT WITH CHECK (true)`,

  // Account
  'ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Users can read own accounts" ON "Account" FOR SELECT USING (userId = auth.uid()::text)`,
  `CREATE POLICY "Users can manage own accounts" ON "Account" FOR ALL USING (userId = auth.uid()::text)`,
  `CREATE POLICY "Allow account creation" ON "Account" FOR INSERT WITH CHECK (userId = auth.uid()::text)`,

  // Subscription
  'ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Users can read own subscriptions" ON "Subscription" FOR SELECT USING (userId = auth.uid()::text)`,
  `CREATE POLICY "Admins can read all subscriptions" ON "Subscription" FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,
  `CREATE POLICY "Admins can manage subscriptions" ON "Subscription" FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,

  // Article
  'ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Anyone can read published articles" ON "Article" FOR SELECT USING ("isPublished" = true)`,
  `CREATE POLICY "Admins and editors can read all articles" ON "Article" FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN'::"UserRole", 'EDITOR'::"UserRole")))`,
  `CREATE POLICY "Admins and editors can manage articles" ON "Article" FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN'::"UserRole", 'EDITOR'::"UserRole")))`,

  // ArticleTranslation
  'ALTER TABLE "ArticleTranslation" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Anyone can read published translations" ON "ArticleTranslation" FOR SELECT USING (EXISTS (SELECT 1 FROM "Article" WHERE "Article".id = "ArticleTranslation"."articleId" AND "Article"."isPublished" = true))`,
  `CREATE POLICY "Admins and editors can manage translations" ON "ArticleTranslation" FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN'::"UserRole", 'EDITOR'::"UserRole")))`,

  // Category
  'ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Anyone can read categories" ON "Category" FOR SELECT USING (true)`,
  `CREATE POLICY "Admins can manage categories" ON "Category" FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,

  // Tag
  'ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Anyone can read tags" ON "Tag" FOR SELECT USING (true)`,
  `CREATE POLICY "Admins can manage tags" ON "Tag" FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,

  // ArticleView
  'ALTER TABLE "ArticleView" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Users can read own views" ON "ArticleView" FOR SELECT USING ("userId" = auth.uid()::text)`,
  `CREATE POLICY "Anyone can create views" ON "ArticleView" FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Admins can read all views" ON "ArticleView" FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,

  // Bookmark
  'ALTER TABLE "Bookmark" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Users can manage own bookmarks" ON "Bookmark" FOR ALL USING ("userId" = auth.uid()::text)`,

  // TranslationFeedback
  'ALTER TABLE "TranslationFeedback" ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "Authenticated users can create feedback" ON "TranslationFeedback" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND "userId" = auth.uid()::text)`,
  `CREATE POLICY "Users can read own feedback" ON "TranslationFeedback" FOR SELECT USING ("userId" = auth.uid()::text)`,
  `CREATE POLICY "Admins can read all feedback" ON "TranslationFeedback" FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,
  `CREATE POLICY "Admins can manage feedback" ON "TranslationFeedback" FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'::"UserRole"))`,
];

async function main() {
  let ok = 0, fail = 0;
  for (const sql of policies) {
    const label = sql.match(/CREATE POLICY "([^"]+)"/)?.[1] ||
                  sql.match(/ALTER TABLE "([^"]+)"/)?.[1] || 'unknown';
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`  ✅ ${label}`);
      ok++;
    } catch (err) {
      if (err.message?.includes('already exists')) {
        console.log(`  ⏭️  ${label} (已存在)`);
        ok++;
      } else {
        console.error(`  ❌ ${label}: ${err.message}`);
        fail++;
      }
    }
  }
  await prisma.$disconnect();
  console.log(`\n📊 完成: ${ok} 成功, ${fail} 失败`);
}

main();
