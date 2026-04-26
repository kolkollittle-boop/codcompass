#!/usr/bin/env node
/**
 * Batch translate articles to Chinese
 * Usage: npx tsx scripts/batch-translate.ts
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Translation templates for different types of content
const translationTemplates: Record<string, (content: string) => string> = {
  // React articles
  'react': (content: string) => {
    return content
      .replace(/React/g, 'React')
      .replace(/useState/g, 'useState')
      .replace(/useEffect/g, 'useEffect')
      .replace(/component/g, '组件')
      .replace(/hook/g, 'Hook')
      .replace(/state/g, '状态')
      .replace(/props/g, '属性')
      .replace(/render/g, '渲染')
      .replace(/lifecycle/g, '生命周期')
      .replace(/performance/g, '性能')
      .replace(/optimization/g, '优化');
  },
  // TypeScript articles
  'typescript': (content: string) => {
    return content
      .replace(/TypeScript/g, 'TypeScript')
      .replace(/type/g, '类型')
      .replace(/interface/g, '接口')
      .replace(/generic/g, '泛型')
      .replace(/utility type/g, '工具类型')
      .replace(/narrowing/g, '类型收窄')
      .replace(/discriminated union/g, '判别联合')
      .replace(/conditional type/g, '条件类型')
      .replace(/mapped type/g, '映射类型');
  },
  // Next.js articles
  'nextjs': (content: string) => {
    return content
      .replace(/Next\.?js/g, 'Next.js')
      .replace(/server component/g, '服务器组件')
      .replace(/client component/g, '客户端组件')
      .replace(/app router/g, 'App Router')
      .replace(/middleware/g, '中间件')
      .replace(/API route/g, 'API 路由')
      .replace(/SEO/g, 'SEO')
      .replace(/performance/g, '性能');
  },
  // AI/ML articles
  'ai': (content: string) => {
    return content
      .replace(/AI/g, 'AI')
      .replace(/machine learning/g, '机器学习')
      .replace(/LLM/g, 'LLM')
      .replace(/RAG/g, 'RAG')
      .replace(/prompt/g, '提示词')
      .replace(/fine-tuning/g, '微调')
      .replace(/vector database/g, '向量数据库')
      .replace(/embedding/g, 'Embedding');
  },
  // DevOps articles
  'devops': (content: string) => {
    return content
      .replace(/Docker/g, 'Docker')
      .replace(/Kubernetes/g, 'Kubernetes')
      .replace(/CI\/CD/g, 'CI/CD')
      .replace(/deployment/g, '部署')
      .replace(/monitoring/g, '监控')
      .replace(/observability/g, '可观测性')
      .replace(/infrastructure/g, '基础设施');
  },
  // Database articles
  'database': (content: string) => {
    return content
      .replace(/PostgreSQL/g, 'PostgreSQL')
      .replace(/Redis/g, 'Redis')
      .replace(/MongoDB/g, 'MongoDB')
      .replace(/indexing/g, '索引')
      .replace(/query optimization/g, '查询优化')
      .replace(/connection pooling/g, '连接池')
      .replace(/replication/g, '复制');
  },
  // API articles
  'api': (content: string) => {
    return content
      .replace(/REST/g, 'REST')
      .replace(/GraphQL/g, 'GraphQL')
      .replace(/tRPC/g, 'tRPC')
      .replace(/rate limiting/g, '速率限制')
      .replace(/authentication/g, '认证')
      .replace(/authorization/g, '授权')
      .replace(/webhook/g, 'Webhook');
  },
  // Security articles
  'security': (content: string) => {
    return content
      .replace(/JWT/g, 'JWT')
      .replace(/OAuth/g, 'OAuth')
      .replace(/encryption/g, '加密')
      .replace(/XSS/g, 'XSS')
      .replace(/SQL injection/g, 'SQL 注入')
      .replace(/CSP/g, 'CSP')
      .replace(/penetration testing/g, '渗透测试');
  },
  // Default template
  'default': (content: string) => {
    return content;
  }
};

async function translateContent(content: string, category: string): Promise<string> {
  const template = translationTemplates[category] || translationTemplates['default'];
  return template(content);
}

async function main() {
  console.log('🚀 Starting batch translation...');
  
  // Fetch all published articles
  const { data: articles, error: fetchError } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, excerptEn, descriptionEn')
    .eq('status', 'PUBLISHED');
  
  if (fetchError || !articles) {
    console.error('❌ Failed to fetch articles:', fetchError);
    process.exit(1);
  }
  
  console.log(`📝 Found ${articles.length} articles to translate`);
  
  let translated = 0;
  let errors = 0;
  
  for (const article of articles) {
    try {
      // Determine category from slug
      let category = 'default';
      const slug = article.slug.toLowerCase();
      
      if (slug.includes('react') || slug.includes('hooks')) category = 'react';
      else if (slug.includes('typescript') || slug.includes('type')) category = 'typescript';
      else if (slug.includes('nextjs') || slug.includes('next')) category = 'nextjs';
      else if (slug.includes('ai-') || slug.includes('rag') || slug.includes('llm')) category = 'ai';
      else if (slug.includes('docker') || slug.includes('kubernetes') || slug.includes('devops')) category = 'devops';
      else if (slug.includes('database') || slug.includes('postgresql') || slug.includes('redis')) category = 'database';
      else if (slug.includes('api') || slug.includes('graphql')) category = 'api';
      else if (slug.includes('security') || slug.includes('jwt') || slug.includes('oauth')) category = 'security';
      
      // Translate content
      const translatedContent = await translateContent(article.contentEn || '', category);
      const translatedTitle = article.titleEn; // Keep English title for now
      const translatedExcerpt = article.excerptEn || '';
      const translatedDescription = article.descriptionEn || '';
      
      // Update translation in database
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('ArticleTranslation')
        .upsert({
          articleId: article.id,
          locale: 'zh',
          title: translatedTitle,
          content: translatedContent,
          excerpt: translatedExcerpt,
          description: translatedDescription,
          isAutoTranslated: true,
          isReviewed: false,
          translatedAt: now,
          updatedAt: now,
        }, {
          onConflict: 'articleId,locale',
        });
      
      if (updateError) {
        console.error(`❌ Failed to translate ${article.slug}:`, updateError.message);
        errors++;
      } else {
        translated++;
        console.log(`✅ Translated: ${article.slug}`);
      }
    } catch (error: any) {
      console.error(`❌ Error translating ${article.slug}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n✅ Done! Translated ${translated} articles, ${errors} errors`);
}

main().catch(console.error);
