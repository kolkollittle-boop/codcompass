#!/usr/bin/env node
/**
 * Fix Chinese headers in existing article content
 * Replaces hardcoded Chinese h3 tags with English equivalents
 * Usage: npx tsx scripts/fix-chinese-content.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// All Chinese header replacements
const REPLACEMENTS = [
  // HN section
  { from: '<h3>💡 为什么值得关注</h3>', to: '<h3>💡 Why It Matters</h3>' },
  { from: '<h3>🔧 技术要点</h3>', to: '<h3>🔧 Tech Details</h3>' },
  { from: '<h3>⚠️ 关键思考</h3>', to: '<h3>⚠️ Key Considerations</h3>' },
  { from: '<h3>🚀 下一步</h3>', to: '<h3>🚀 Next Steps</h3>' },
  // Dev.to section
  { from: '<h3>💡 核心要点</h3>', to: '<h3>💡 Key Takeaways</h3>' },
  { from: '<h3>🔧 技术内容</h3>', to: '<h3>🔧 Tech Content</h3>' },
  { from: '<h3>⚠️ 值得关注的点</h3>', to: '<h3>⚠️ Why It Matters</h3>' },
  { from: '<h3>🚀 延伸阅读</h3>', to: '<h3>🚀 Further Reading</h3>' },
];

async function fixContent(field: string, table: string) {
  console.log(`\n📝 Checking ${table}.${field}...`);

  const { data: articles, error } = await supabase
    .from(table)
    .select('id', field)
    .ilike(field, '%<h3>%中文%');

  if (error) {
    console.error(`   ❌ Query failed: ${error.message}`);
    return 0;
  }

  if (!articles || articles.length === 0) {
    console.log(`   ✅ No articles with Chinese headers found`);
    return 0;
  }

  console.log(`   Found ${articles.length} articles to fix`);

  let fixed = 0;
  for (const article of articles) {
    let content = article[field];
    let changed = false;

    for (const replacement of REPLACEMENTS) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        changed = true;
      }
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from(table)
        .update({ [field]: content })
        .eq('id', article.id);

      if (updateError) {
        console.error(`   ❌ Failed to update article ${article.id}: ${updateError.message}`);
      } else {
        fixed++;
        console.log(`   ✅ Fixed article ${article.id}`);
      }
    }
  }

  return fixed;
}

async function main() {
  console.log('🔧 Fixing Chinese headers in existing articles...');

  let totalFixed = 0;

  // Fix contentEn in Article table
  totalFixed += await fixContent('contentEn', 'Article');

  // Fix content in ArticleTranslation table (zh locale copies)
  totalFixed += await fixContent('content', 'ArticleTranslation');

  console.log(`\n✅ Done! Fixed ${totalFixed} articles total`);
}

main().catch(console.error);
