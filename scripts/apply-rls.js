// Apply RLS policies to Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekunyyscyqhasolbbohw.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey || serviceKey.includes('YOUR_SERVICE_ROLE_KEY')) {
  console.error('❌ 需要设置 SUPABASE_SERVICE_ROLE_KEY');
  console.error('请在 .env 中填入你的 Service Role Key');
  console.error('\n获取方式:');
  console.error('1. 打开 https://supabase.com/dashboard/project/ekunyyscyqhasolbbohw/settings/api');
  console.error('2. 复制 service_role key (secret)');
  console.error('3. 粘贴到 .env 的 SUPABASE_SERVICE_ROLE_KEY=');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

import { readFileSync } from 'fs';

const sql = readFileSync('./prisma/rls_policies.sql', 'utf-8');

// Split by semicolons and execute each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`📋 找到 ${statements.length} 条 SQL 语句\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  // Extract comment for display
  const comment = stmt.match(/-- (.+)/)?.[1] || `Statement ${i + 1}`;
  
  const { error } = await supabase.rpc('exec_sql', { sql: stmt }).catch(() => {
    // If rpc doesn't exist, use REST API
    return supabase.from('_sql').select('*').limit(1);
  });
  
  // Use raw SQL via postgres connection instead
  console.log(`  ⏳ ${comment}...`);
}

console.log('\n⚠️  由于 Supabase 限制，请手动执行 SQL:');
console.log('\n📋 操作步骤:');
console.log('1. 打开 https://supabase.com/dashboard/project/ekunyyscyqhasolbbohw/sql');
console.log('2. 复制 prisma/rls_policies.sql 的全部内容');
console.log('3. 粘贴到 SQL Editor');
console.log('4. 点击 "Run" 执行');
console.log('\n✅ 完成后所有表将启用行级安全策略！');
