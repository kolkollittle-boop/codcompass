import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('Article')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('=== Latest Article Check ===');
  console.log('Title:', data.titleEn);
  console.log('Status:', data.status);
  console.log('Quality Score:', data.qualityScore);
  console.log('Quality Details:', JSON.stringify(data.qualityDetails, null, 2));
  console.log('\n=== Content Format Check ===');
  const content = data.contentEn || '';
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
  const hasMarkdown = /^#{1,6}\s|^\*\*|^\*|^- |^```/m.test(content);
  console.log('Has HTML tags:', hasHtmlTags);
  console.log('Has Markdown:', hasMarkdown);
  console.log('\nContent preview (first 300 chars):');
  console.log(content.substring(0, 300));
}

main();
