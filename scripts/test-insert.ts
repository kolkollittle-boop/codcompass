#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🧪 Testing Insert...');

  const testId = 'test-' + Date.now();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('Article')
    .insert({
      id: testId,
      slug: 'test-insert-' + Date.now(),
      titleEn: 'Test Article',
      contentEn: 'This is a test.',
      excerptEn: 'Test',
      isPremium: false,
      isPublished: true,
      status: 'PUBLISHED',
      sourceSite: 'Test',
      sourceAuthor: 'Test',
      sourceUrl: 'https://test.com',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Insert Failed:', error.message, error.details);
    return;
  }

  console.log('✅ Insert Success:', data.id);
  
  // Cleanup
  await supabase.from('Article').delete().eq('id', testId);
  console.log('🧹 Cleaned up test row.');
}

main().catch(console.error);
