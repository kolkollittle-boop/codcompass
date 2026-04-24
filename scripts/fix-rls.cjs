// Fix remaining RLS policies - quote camelCase column names
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const policies = [
  // Account
  `CREATE POLICY "Users can read own accounts" ON "Account" FOR SELECT USING ("userId" = auth.uid()::text)`,
  `CREATE POLICY "Users can manage own accounts" ON "Account" FOR ALL USING ("userId" = auth.uid()::text)`,
  `CREATE POLICY "Allow account creation" ON "Account" FOR INSERT WITH CHECK ("userId" = auth.uid()::text)`,

  // Subscription
  `CREATE POLICY "Users can read own subscriptions" ON "Subscription" FOR SELECT USING ("userId" = auth.uid()::text)`,

  // ArticleView
  `CREATE POLICY "Users can read own views" ON "ArticleView" FOR SELECT USING ("userId" = auth.uid()::text)`,

  // Bookmark
  `CREATE POLICY "Users can manage own bookmarks" ON "Bookmark" FOR ALL USING ("userId" = auth.uid()::text)`,

  // TranslationFeedback
  `CREATE POLICY "Authenticated users can create feedback" ON "TranslationFeedback" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND "userId" = auth.uid()::text)`,
  `CREATE POLICY "Users can read own feedback" ON "TranslationFeedback" FOR SELECT USING ("userId" = auth.uid()::text)`,
];

async function main() {
  let ok = 0, fail = 0;
  for (const sql of policies) {
    const label = sql.match(/CREATE POLICY "([^"]+)"/)?.[1] || 'unknown';
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
