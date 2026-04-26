#!/usr/bin/env node
/**
 * AI-powered batch translation to Chinese
 * Uses OpenAI API to generate high-quality Chinese translations
 * Usage: npx tsx scripts/ai-translate.ts
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function translateWithAI(englishContent: string, title: string): Promise<{
  title: string;
  content: string;
  excerpt: string;
}> {
  const prompt = `你是一个专业的技术内容翻译专家。请将以下英文技术文章翻译成中文，保持技术宅风格。

## 翻译要求：
1. 技术术语保留英文（如 React Hooks、TypeScript、API 等）
2. 语气要像中文技术博主（"你懂的"、"说实话"、"踩坑了"）
3. 代码示例保留英文注释，但关键行加中文注释
4. 不要机翻感，要自然流畅
5. 保持原文的技术准确性和结构
6. 添加适当的 emoji 和排版

## 原文标题：
${title}

## 原文内容：
${englishContent}

## 输出格式：
请返回 JSON 格式：
{
  "title": "中文标题",
  "content": "中文内容（HTML 格式）",
  "excerpt": "中文摘要（100 字以内）"
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '你是一个专业的技术内容翻译专家，擅长将英文技术文章翻译成中文技术宅风格。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 解析 JSON 响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error: any) {
    console.error('AI translation error:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting AI-powered batch translation...');
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set');
    process.exit(1);
  }
  
  // Fetch all published articles
  const { data: articles, error: fetchError } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, excerptEn, descriptionEn')
    .eq('status', 'PUBLISHED')
    .limit(10); // Start with 10 articles for testing
  
  if (fetchError || !articles) {
    console.error('❌ Failed to fetch articles:', fetchError);
    process.exit(1);
  }
  
  console.log(`📝 Found ${articles.length} articles to translate`);
  
  let translated = 0;
  let errors = 0;
  
  for (const article of articles) {
    try {
      console.log(`\n🔄 Translating: ${article.slug}`);
      
      // Translate with AI
      const translation = await translateWithAI(article.contentEn || '', article.titleEn);
      
      // Delete existing translation
      await supabase
        .from('ArticleTranslation')
        .delete()
        .eq('articleId', article.id)
        .eq('locale', 'zh');
      
      // Insert new translation
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('ArticleTranslation')
        .insert({
          id: crypto.randomUUID(),
          articleId: article.id,
          locale: 'zh',
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt,
          description: article.descriptionEn || '',
          isAutoTranslated: false,
          isReviewed: true,
          translatedAt: now,
          updatedAt: now,
        });
      
      if (updateError) {
        console.error(`❌ Failed to save translation for ${article.slug}:`, updateError.message);
        errors++;
      } else {
        translated++;
        console.log(`✅ Translated: ${article.slug} -> ${translation.title}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error(`❌ Error translating ${article.slug}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n✅ Done! Translated ${translated} articles, ${errors} errors`);
}

main().catch(console.error);
