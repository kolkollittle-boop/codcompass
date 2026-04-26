#!/usr/bin/env node
/**
 * Deep test script for Codcompass
 * Tests all major features and components
 * Usage: npx tsx scripts/deep-test.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test results tracking
const results: Record<string, { passed: number; failed: number; errors: string[] }> = {
  'Database': { passed: 0, failed: 0, errors: [] },
  'Search': { passed: 0, failed: 0, errors: [] },
  'AI Chat': { passed: 0, failed: 0, errors: [] },
  'Code Review': { passed: 0, failed: 0, errors: [] },
  'Multi-language': { passed: 0, failed: 0, errors: [] },
  'Categories': { passed: 0, failed: 0, errors: [] },
  'Articles': { passed: 0, failed: 0, errors: [] },
};

function log(category: string, test: string, success: boolean, error?: string) {
  const status = success ? '✅' : '❌';
  console.log(`  ${status} ${test}`);
  if (success) {
    results[category].passed++;
  } else {
    results[category].failed++;
    if (error) results[category].errors.push(error);
  }
}

async function testDatabase() {
  console.log('\n📊 Database Tests');
  
  // Test 1: Connection
  try {
    const { data, error } = await supabase.from('Article').select('count').single();
    log('Database', 'Database connection', !error, error?.message);
  } catch (e: any) {
    log('Database', 'Database connection', false, e.message);
  }
  
  // Test 2: Article count
  try {
    const { count } = await supabase.from('Article').select('*', { count: 'exact', head: true });
    log('Database', `Article count: ${count}`, (count || 0) > 50, `Expected > 50, got ${count}`);
  } catch (e: any) {
    log('Database', 'Article count', false, e.message);
  }
  
  // Test 3: Translation count
  try {
    const { count } = await supabase.from('ArticleTranslation').select('*', { count: 'exact', head: true });
    log('Database', `Translation count: ${count}`, (count || 0) > 0, `Expected > 0, got ${count}`);
  } catch (e: any) {
    log('Database', 'Translation count', false, e.message);
  }
}

async function testSearch() {
  console.log('\n🔍 Search Tests');
  
  // Test 1: Search by keyword
  try {
    const { data } = await supabase
      .from('Article')
      .select('id, slug, titleEn')
      .or('titleEn.ilike.%react%,excerptEn.ilike.%react%')
      .eq('isPublished', true)
      .limit(5);
    
    log('Search', 'Search React keyword', (data?.length || 0) > 0, `Found ${data?.length || 0} results`);
  } catch (e: any) {
    log('Search', 'Search React keyword', false, e.message);
  }
  
  // Test 2: Search by TypeScript
  try {
    const { data } = await supabase
      .from('Article')
      .select('id, slug, titleEn')
      .or('titleEn.ilike.%typescript%,excerptEn.ilike.%typescript%')
      .eq('isPublished', true)
      .limit(5);
    
    log('Search', 'Search TypeScript keyword', (data?.length || 0) > 0, `Found ${data?.length || 0} results`);
  } catch (e: any) {
    log('Search', 'Search TypeScript keyword', false, e.message);
  }
  
  // Test 3: Search with no results
  try {
    const { data } = await supabase
      .from('Article')
      .select('id, slug')
      .or('titleEn.ilike.%xyz123abc%,excerptEn.ilike.%xyz123abc%')
      .eq('isPublished', true)
      .limit(5);
    
    log('Search', 'Search non-existent keyword', (data?.length || 0) === 0, `Found ${data?.length || 0} results`);
  } catch (e: any) {
    log('Search', 'Search non-existent keyword', false, e.message);
  }
}

async function testAIChat() {
  console.log('\n🤖 AI Chat Tests');
  
  // Test 1: React query
  try {
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about React' }),
    });
    
    const data = await response.json();
    log('AI Chat', 'React query', response.ok && data.reply?.length > 0, `Status: ${response.status}`);
  } catch (e: any) {
    log('AI Chat', 'React query', false, e.message);
  }
  
  // Test 2: TypeScript query
  try {
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about TypeScript' }),
    });
    
    const data = await response.json();
    log('AI Chat', 'TypeScript query', response.ok && data.reply?.length > 0, `Status: ${response.status}`);
  } catch (e: any) {
    log('AI Chat', 'TypeScript query', false, e.message);
  }
  
  // Test 3: Empty message
  try {
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });
    
    log('AI Chat', 'Empty message handling', response.status === 400, `Status: ${response.status}`);
  } catch (e: any) {
    log('AI Chat', 'Empty message handling', false, e.message);
  }
}

async function testCodeReview() {
  console.log('\n🔍 Code Review Tests');
  
  // Test 1: TypeScript review
  try {
    const response = await fetch('http://localhost:3000/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'const x: any = "test";\nconsole.log(x);\nvar y = 1;',
        language: 'typescript',
      }),
    });
    
    const data = await response.json();
    log('Code Review', 'TypeScript review', response.ok && data.score !== undefined, `Score: ${data.score}`);
  } catch (e: any) {
    log('Code Review', 'TypeScript review', false, e.message);
  }
  
  // Test 2: JavaScript review
  try {
    const response = await fetch('http://localhost:3000/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'var x = 1;\nconsole.log(x);\nif (x == null) {}',
        language: 'javascript',
      }),
    });
    
    const data = await response.json();
    log('Code Review', 'JavaScript review', response.ok && data.score !== undefined, `Score: ${data.score}`);
  } catch (e: any) {
    log('Code Review', 'JavaScript review', false, e.message);
  }
  
  // Test 3: Python review
  try {
    const response = await fetch('http://localhost:3000/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'print("hello")\nexcept:\n  pass',
        language: 'python',
      }),
    });
    
    const data = await response.json();
    log('Code Review', 'Python review', response.ok && data.score !== undefined, `Score: ${data.score}`);
  } catch (e: any) {
    log('Code Review', 'Python review', false, e.message);
  }
  
  // Test 4: Empty code
  try {
    const response = await fetch('http://localhost:3000/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' }),
    });
    
    log('Code Review', 'Empty code handling', response.status === 400, `Status: ${response.status}`);
  } catch (e: any) {
    log('Code Review', 'Empty code handling', false, e.message);
  }
}

async function testMultiLanguage() {
  console.log('\n🌍 Multi-language Tests');
  
  // Test 1: Chinese translation exists
  try {
    const { data } = await supabase
      .from('ArticleTranslation')
      .select('articleId, locale, title')
      .eq('locale', 'zh')
      .limit(5);
    
    log('Multi-language', 'Chinese translations exist', (data?.length || 0) > 0, `Found ${data?.length || 0} translations`);
  } catch (e: any) {
    log('Multi-language', 'Chinese translations exist', false, e.message);
  }
  
  // Test 2: Check specific translation
  try {
    const { data: article } = await supabase
      .from('Article')
      .select('id')
      .eq('slug', 'react-hooks-deep-dive')
      .single();
    
    if (article) {
      const { data: translation } = await supabase
        .from('ArticleTranslation')
        .select('title, content')
        .eq('articleId', article.id)
        .eq('locale', 'zh')
        .single();
      
      log('Multi-language', 'React Hooks Chinese translation', 
        translation?.title?.includes('React Hooks') || translation?.title?.includes('Hooks'),
        `Title: ${translation?.title}`
      );
    } else {
      log('Multi-language', 'React Hooks article exists', false, 'Article not found');
    }
  } catch (e: any) {
    log('Multi-language', 'React Hooks Chinese translation', false, e.message);
  }
}

async function testCategories() {
  console.log('\n📂 Category Tests');
  
  // Test 1: All 9 categories exist
  try {
    const { data: categories } = await supabase
      .from('Category')
      .select('slug, nameEn')
      .order('order');
    
    const expectedSlugs = ['ai-llm', 'database', 'api', 'frontend', 'backend', 'devops', 'mobile', 'security', 'product'];
    const actualSlugs = categories?.map(c => c.slug) || [];
    
    const allExist = expectedSlugs.every(slug => actualSlugs.includes(slug));
    log('Categories', 'All 9 categories exist', allExist, `Found: ${actualSlugs.join(', ')}`);
  } catch (e: any) {
    log('Categories', 'All 9 categories exist', false, e.message);
  }
  
  // Test 2: Article-Category links
  try {
    const { count } = await supabase
      .from('_ArticleToCategory')
      .select('*', { count: 'exact', head: true });
    
    log('Categories', `Article-Category links: ${count}`, (count || 0) > 0, `Expected > 0, got ${count}`);
  } catch (e: any) {
    log('Categories', 'Article-Category links', false, e.message);
  }
}

async function testArticles() {
  console.log('\n📝 Article Tests');
  
  // Test 1: Published articles
  try {
    const { count } = await supabase
      .from('Article')
      .select('*', { count: 'exact', head: true })
      .eq('isPublished', true);
    
    log('Articles', `Published articles: ${count}`, (count || 0) > 50, `Expected > 50, got ${count}`);
  } catch (e: any) {
    log('Articles', 'Published articles count', false, e.message);
  }
  
  // Test 2: Premium articles
  try {
    const { count } = await supabase
      .from('Article')
      .select('*', { count: 'exact', head: true })
      .eq('isPremium', true);
    
    log('Articles', `Premium articles: ${count}`, (count || 0) > 0, `Expected > 0, got ${count}`);
  } catch (e: any) {
    log('Articles', 'Premium articles count', false, e.message);
  }
  
  // Test 3: Article with content
  try {
    const { data } = await supabase
      .from('Article')
      .select('slug, titleEn, contentEn')
      .eq('isPublished', true)
      .limit(5);
    
    const hasContent = data?.filter(a => a.contentEn && a.contentEn.length > 100) || [];
    log('Articles', `Articles with substantial content: ${hasContent.length}`, hasContent.length > 0, `Expected > 0`);
  } catch (e: any) {
    log('Articles', 'Articles with content', false, e.message);
  }
}

async function main() {
  console.log('🚀 Starting deep tests...\n');
  
  await testDatabase();
  await testSearch();
  await testAIChat();
  await testCodeReview();
  await testMultiLanguage();
  await testCategories();
  await testArticles();
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const [category, result] of Object.entries(results)) {
    console.log(`\n${category}:`);
    console.log(`  ✅ Passed: ${result.passed}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`);
    }
    totalPassed += result.passed;
    totalFailed += result.failed;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`Success rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
}

main().catch(console.error);
