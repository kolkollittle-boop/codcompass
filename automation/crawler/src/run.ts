// automation/crawler/src/run.ts
import { scoreArticle } from './ai-scorer';
import { ingestArticle } from './ingest';
import { restructureArticle } from './article-restructurer';
import TurndownService from 'turndown';

// Dev.to API 配置
const DEVTO_API_URL = 'https://dev.to/api/articles';
const DEVTO_TAGS = ['javascript', 'typescript', 'react', 'node', 'python', 'ai', 'machinelearning'];
const ARTICLES_PER_TAG = 5;

// 初始化 Turndown 服务（HTML -> Markdown）
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// 保留图片链接
turndownService.addRule('image', {
  filter: 'img',
  replacement: (content, node: any) => {
    const alt = node.alt || '';
    const src = node.getAttribute('src');
    if (src) {
      return `![${alt}](${src})`;
    }
    return '';
  },
});

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  tags: string[];
  user: {
    name: string;
    username: string;
  };
  published_at: string;
  positive_reactions_count: number;
  reading_time_minutes: number;
  body_html?: string;
  body_markdown?: string;
  cover_image?: string;
}

/**
 * 从 Dev.to API 获取文章列表
 */
async function fetchArticlesFromDevTo(): Promise<DevToArticle[]> {
  const allArticles: DevToArticle[] = [];
  
  for (const tag of DEVTO_TAGS) {
    console.log(`📚 Fetching articles from Dev.to with tag: ${tag}`);
    
    const url = `${DEVTO_API_URL}?tag=${tag}&per_page=${ARTICLES_PER_TAG}&sort_by=public_reactions_count`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CodcompassKB/1.0 (educational crawler)',
        },
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch ${tag}: ${response.status}`);
        continue;
      }
      
      const articles: DevToArticle[] = await response.json();
      console.log(`✅ Got ${articles.length} articles for tag: ${tag}`);
      
      allArticles.push(...articles);
      
      // Dev.to 速率限制：等待 1 秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error fetching ${tag}:`, error);
    }
  }
  
  // 去重（基于 URL）
  const seen = new Set<string>();
  const uniqueArticles = allArticles.filter(article => {
    if (seen.has(article.url)) {
      return false;
    }
    seen.add(article.url);
    return true;
  });
  
  console.log(`\n📊 Total unique articles: ${uniqueArticles.length}`);
  return uniqueArticles;
}

/**
 * 获取单篇文章的完整内容并转换为 Markdown
 */
async function fetchArticleContent(article: DevToArticle): Promise<{ markdown: string, images: string[] }> {
  try {
    // Dev.to API 可以通过 /articles/:id 获取完整内容
    const url = `${DEVTO_API_URL}/${article.id}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CodcompassKB/1.0 (educational crawler)',
      },
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch full content for article ${article.id}`);
      return { markdown: article.description || '', images: [] };
    }
    
    const fullArticle: DevToArticle = await response.json();
    
    // 提取图片列表
    const images: string[] = [];
    if (fullArticle.cover_image) {
      images.push(fullArticle.cover_image);
    }
    
    // 优先使用 HTML，转换为 Markdown
    let markdown = '';
    if (fullArticle.body_html) {
      // 清理 HTML（移除脚本、样式等）
      const cleanedHtml = cleanHtml(fullArticle.body_html);
      markdown = turndownService.turndown(cleanedHtml);
    } else if (fullArticle.body_markdown) {
      markdown = fullArticle.body_markdown;
    } else {
      markdown = article.description || '';
    }
    
    // 从内容中提取更多图片
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = imgRegex.exec(markdown)) !== null) {
      if (!images.includes(match[1])) {
        images.push(match[1]);
      }
    }
    
    return { markdown, images };
  } catch (error) {
    console.error(`❌ Error fetching content for article ${article.id}:`, error);
    return { markdown: article.description || '', images: [] };
  }
}

/**
 * 清理 HTML，移除不需要的元素
 */
function cleanHtml(html: string): string {
  // 移除脚本和样式
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // 移除导航、页脚等
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '');
  
  // 移除 Dev.to 特定的 class
  html = html.replace(/\s*class="[^"]*"\s*/gi, '');
  
  return html;
}

/**
 * 使用 AI 翻译文章为中文（全文翻译）
 */
async function translateToChinese(title: string, content: string): Promise<string> {
  try {
    // 如果内容太长，分段翻译（每段约 3000 字）
    const MAX_CHUNK_SIZE = 3000;
    
    if (content.length <= MAX_CHUNK_SIZE) {
      // 短内容：一次翻译
      return await translateChunk(title, content);
    }
    
    // 长内容：分段翻译后合并
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += MAX_CHUNK_SIZE) {
      const chunk = content.substring(i, i + MAX_CHUNK_SIZE);
      const isLastChunk = i + MAX_CHUNK_SIZE >= content.length;
      const translated = await translateChunk(
        isLastChunk ? title : `（续）`,
        chunk
      );
      if (translated) {
        chunks.push(translated);
      }
      // API 速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return chunks.join('\n\n---\n\n');
  } catch (error) {
    console.error(`❌ Translation error:`, error);
    return '';
  }
}

/**
 * 翻译单个段落
 */
async function translateChunk(title: string, content: string): Promise<string> {
  const response = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'system',
          content: `你是一位专业的技术翻译家，擅长将英文技术文章翻译成流畅的中文。
请保持以下要求：
1. 技术术语保持英文（如 React, TypeScript, API 等）
2. 代码块不要翻译
3. 保持 Markdown 格式不变
4. 只翻译文本内容
5. 输出翻译后的中文内容，不要添加额外说明`,
        },
        {
          role: 'user',
          content: `请将以下文章翻译成中文：\n\n标题：${title}\n\n内容：${content}`,
        },
      ],
    }),
  });
  
  if (!response.ok) {
    console.warn(`⚠️ Translation failed: ${response.status}`);
    return '';
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function main() {
  console.log("🚀 Starting Codcompass Crawler (Concurrent Mode)...");
  console.log("📡 Source: Dev.to API\n");

  // 1. 获取文章列表
  const articles = await fetchArticlesFromDevTo();
  
  if (articles.length === 0) {
    console.log("❌ No articles found. Exiting.");
    return;
  }

  // 2. 并发处理配置
  const CONCURRENCY = 2; // 同时处理的文章数量（降低并发避免API限速）
  const SCORE_THRESHOLD = 75; // 75分以上自动审核通过
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  
  // 单篇文章处理函数
  async function processArticle(article: DevToArticle, index: number) {
    console.log(`\n[${index + 1}/${articles.length}] Processing: ${article.title}`);
    
    try {
      // 获取完整内容并转换为 Markdown
      const { markdown, images } = await fetchArticleContent(article);
      
      if (!markdown || markdown.length < 100) {
        console.log(`⏭️ Skipping: content too short (${markdown?.length || 0} chars)`);
        return { success: false, skipped: true, title: article.title };
      }
      
      console.log(`📝 Content length: ${markdown.length} chars`);
      console.log(`🖼️ Images found: ${images.length}`);
      
      // AI 评分
      console.log(`🧐 AI scoring...`);
      const evaluation = await scoreArticle(article.title, markdown);
      
      if (!evaluation.score) {
        console.log(`⏭️ Skipping: AI scoring failed`);
        return { success: false, skipped: true, title: article.title };
      }
      
      // 低于阈值则跳过
      if (evaluation.score < SCORE_THRESHOLD) {
        console.log(`⏭️ Skipping: score ${evaluation.score} below threshold ${SCORE_THRESHOLD}`);
        return { success: false, skipped: true, title: article.title };
      }
      
      console.log(`✅ Score: ${evaluation.score}/100`);
      console.log(`   Difficulty: ${evaluation.difficulty_level || 'N/A'}`);
      console.log(`   Promotional: ${evaluation.is_promotional || false}`);
      
      // AI 重构文章为标准结构
      console.log(`🔄 Restructuring article to Codcompass 2.0 format...`);
      const restructured = await restructureArticle(article.title, markdown, evaluation);
      console.log(`✅ Article restructured (${restructured.content.length} chars)`);
      console.log(`   Tags: ${restructured.tags.join(', ') || 'N/A'}`);
      console.log(`   Reading time: ${restructured.readingTimeMinutes} min`);
      
      // AI 翻译（中文预览）
      console.log(`🌐 Translating to Chinese...`);
      const chinesePreview = await translateToChinese(restructured.title, restructured.content);
      if (chinesePreview) {
        console.log(`✅ Chinese preview generated (${chinesePreview.length} chars)`);
      }
      
      // 入库
      console.log(`📡 Sending to database...`);
      await ingestArticle({
        title: restructured.title,
        content: restructured.content,
        sourceUrl: article.url,
        score: evaluation.score,
        dimensions: evaluation.dimensions,
        difficulty_level: restructured.difficultyLevel,
        is_promotional: evaluation.is_promotional,
        mentor_summary: evaluation.mentor_summary,
        chinese_preview: chinesePreview,
        images: images,
        tags: restructured.tags,
        reading_time_minutes: restructured.readingTimeMinutes,
        expected_outcome: restructured.expectedOutcome,
        excerpt: restructured.excerpt,
      });
      
      console.log(`✅ Successfully processed`);
      return { success: true, skipped: false, title: article.title };
    } catch (error) {
      console.error(`❌ Failed to process "${article.title}":`, error);
      return { success: false, skipped: false, title: article.title, error };
    }
  }
  
  // 3. 分批并发处理
  for (let i = 0; i < articles.length; i += CONCURRENCY) {
    const batch = articles.slice(i, i + CONCURRENCY);
    const batchIndex = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(articles.length / CONCURRENCY);
    
    console.log(`\n📦 Batch ${batchIndex}/${totalBatches} (processing ${batch.length} articles concurrently)`);
    
    const results = await Promise.all(
      batch.map((article, batchIdx) => processArticle(article, i + batchIdx))
    );
    
    // 统计批次结果
    results.forEach(result => {
      if (result.success) successCount++;
      else if (result.skipped) skippedCount++;
      else failCount++;
    });
    
    // 批次间添加延迟，避免 API 限速
    if (i + CONCURRENCY < articles.length) {
      console.log(`\n⏳ Waiting 5 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Crawler completed!");
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️ Skipped (low quality): ${skippedCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${articles.length}`);
}

main().catch(error => {
  console.error("❌ Execution failed:", error);
  process.exit(1);
});
