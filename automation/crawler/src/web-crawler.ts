/**
 * 通用网页爬虫 - 支持 Roadmap.sh、Refactoring.Guru、Vercel Blog、Cloudflare Blog、InfoQ、GitHub 等站点
 *
 * 基于 Readability 提取正文，统一返回 DevToArticle 兼容格式
 *
 * 更新：使用代理池轮换，请求失败时自动切换代理重试
 */
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { extractReadabilityContentHtml } from './readability-html';
import { fetchWithProxyRetry } from './proxy-env';

export interface WebArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  user: { name: string; username: string };
  published_at: string;
  positive_reactions_count: number;
  reading_time_minutes: number;
  body_html?: string;
  body_markdown?: string;
  cover_image?: string;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

turndownService.addRule('image', {
  filter: 'img',
  replacement: (_content, node: any) => {
    const alt = node.alt || '';
    const src = node.getAttribute('src');
    return src ? `![${alt}](${src})` : '';
  },
});

function cleanHtml(html: string): string {
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '');
  html = html.replace(/\s*class="[^"]*"\s*/gi, '');
  return html;
}

function htmlToMarkdown(html: string): { markdown: string; images: string[] } {
  const images: string[] = [];
  const readableHtml = extractReadabilityContentHtml(html, '');
  const htmlSrc = readableHtml ?? cleanHtml(html);
  const markdown = turndownService.turndown(htmlSrc);

  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  while ((match = imgRegex.exec(markdown)) !== null) {
    if (!images.includes(match[1])) images.push(match[1]);
  }
  return { markdown, images };
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * 带代理轮换的 fetch 包装器
 * 使用 proxy-env.ts 中的 fetchWithProxyRetry，请求失败时自动切换代理
 */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<string> {
  const response = await fetchWithProxyRetry(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  }, maxRetries);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.text();
}

/**
 * Roadmap.sh 爬虫
 * 抓取 roadmap 节点描述与推荐资源
 */
export async function fetchRoadmapSh(): Promise<WebArticle[]> {
  console.log('[Roadmap.sh] 开始爬取...');
  const articles: WebArticle[] = [];
  
  try {
    // Roadmap.sh 的 roadmap 列表页
    const html = await fetchWithRetry('https://roadmap.sh/roadmaps');
    const $ = cheerio.load(html);
    
    // 提取所有 roadmap 链接
    const links: { title: string; url: string }[] = [];
    $('a[href^="/"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && href.startsWith('/roadmaps/') && text && !links.find(l => l.url === href)) {
        links.push({ title: text, url: `https://roadmap.sh${href}` });
      }
    });
    
    // 去重并限制数量
    const uniqueLinks = links.slice(0, 20);
    console.log(`[Roadmap.sh] 发现 ${uniqueLinks.length} 个 roadmap`);
    
    for (const link of uniqueLinks) {
      try {
        console.log(`[Roadmap.sh] 抓取: ${link.url}`);
        const pageHtml = await fetchWithRetry(link.url);
        const page$ = cheerio.load(pageHtml);
        
        // 提取标题
        const title = page$('h1').first().text().trim() || link.title;
        
        // 提取正文内容（使用 Readability）
        const bodyHtml = page$('main').html() || page$('#__next').html() || '';
        
        if (bodyHtml) {
          articles.push({
            id: `roadmapsh_${Buffer.from(link.url).toString('base64url')}`,
            title: `Roadmap.sh: ${title}`,
            description: title,
            url: link.url,
            tags: ['roadmap', 'learning-path', 'developer'],
            user: { name: 'Roadmap.sh', username: 'roadmapsh' },
            published_at: new Date().toISOString(),
            positive_reactions_count: 0,
            reading_time_minutes: estimateReadingTime(page$.text()),
            body_html: bodyHtml,
            cover_image: page$('meta[property="og:image"]').attr('content'),
          });
        }
        
        // 礼貌延迟
        await new Promise(r => setTimeout(r, 1000));
      } catch (error: any) {
        console.warn(`[Roadmap.sh] 抓取失败: ${link.url} - ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('[Roadmap.sh] 爬取失败:', error.message);
  }
  
  console.log(`[Roadmap.sh] 完成，共 ${articles.length} 篇文章`);
  return articles;
}

/**
 * Refactoring.Guru 爬虫
 * 提取设计模式 UML 与示例代码
 */
export async function fetchRefactoringGuru(): Promise<WebArticle[]> {
  console.log('[Refactoring.Guru] 开始爬取...');
  const articles: WebArticle[] = [];
  
  const patterns = [
    { name: 'Design Patterns', url: 'https://refactoring.guru/design-patterns' },
    { name: 'Refactoring Techniques', url: 'https://refactoring.guru/refactoring/techniques' },
  ];
  
  for (const pattern of patterns) {
    try {
      console.log(`[Refactoring.Guru] 抓取: ${pattern.url}`);
      const html = await fetchWithRetry(pattern.url);
      const $ = cheerio.load(html);
      
      // 提取文章链接
      const links: { title: string; url: string }[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && href.includes('/design-patterns/') && text && !href.includes('#')) {
          const fullUrl = href.startsWith('http') ? href : `https://refactoring.guru${href}`;
          if (!links.find(l => l.url === fullUrl)) {
            links.push({ title: text, url: fullUrl });
          }
        }
      });
      
      // 去重并限制数量
      const uniqueLinks = [...new Map(links.map(l => [l.url, l])).values()].slice(0, 15);
      console.log(`[Refactoring.Guru] 发现 ${uniqueLinks.length} 个模式`);
      
      for (const link of uniqueLinks) {
        try {
          console.log(`[Refactoring.Guru] 抓取详情: ${link.url}`);
          const pageHtml = await fetchWithRetry(link.url);
          const page$ = cheerio.load(pageHtml);
          
          const title = page$('h1').first().text().trim() || link.title;
          const bodyHtml = page$('.post__content').html() || page$('article').html() || '';
          
          if (bodyHtml) {
            articles.push({
              id: `refactoringguru_${Buffer.from(link.url).toString('base64url')}`,
              title: `Refactoring.Guru: ${title}`,
              description: title,
              url: link.url,
              tags: ['design-patterns', 'refactoring', 'architecture'],
              user: { name: 'Refactoring.Guru', username: 'refactoringguru' },
              published_at: new Date().toISOString(),
              positive_reactions_count: 0,
              reading_time_minutes: estimateReadingTime(page$.text()),
              body_html: bodyHtml,
              cover_image: page$('meta[property="og:image"]').attr('content'),
            });
          }
          
          await new Promise(r => setTimeout(r, 1500));
        } catch (error: any) {
          console.warn(`[Refactoring.Guru] 抓取失败: ${link.url} - ${error.message}`);
        }
      }
    } catch (error: any) {
      console.warn(`[Refactoring.Guru] 列表页失败: ${pattern.url} - ${error.message}`);
    }
  }
  
  console.log(`[Refactoring.Guru] 完成，共 ${articles.length} 篇文章`);
  return articles;
}

/**
 * Vercel Blog 爬虫
 * 通过 RSS feed 或列表页抓取
 */
export async function fetchVercelBlog(): Promise<WebArticle[]> {
  console.log('[Vercel Blog] 开始爬取...');
  const articles: WebArticle[] = [];
  
  try {
    // Vercel 博客列表页
    const html = await fetchWithRetry('https://vercel.com/blog');
    const $ = cheerio.load(html);
    
    // 提取博客文章链接
    const links: { title: string; url: string }[] = [];
    $('a[href^="/blog/"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).find('h2, h3, p').first().text().trim() || $(el).text().trim();
      if (href && href.startsWith('/blog/') && text && !href.includes('#')) {
        const fullUrl = `https://vercel.com${href}`;
        if (!links.find(l => l.url === fullUrl) && text.length > 10) {
          links.push({ title: text, url: fullUrl });
        }
      }
    });
    
    const uniqueLinks = [...new Map(links.map(l => [l.url, l])).values()].slice(0, 15);
    console.log(`[Vercel Blog] 发现 ${uniqueLinks.length} 篇文章`);
    
    for (const link of uniqueLinks) {
      try {
        console.log(`[Vercel Blog] 抓取详情: ${link.url}`);
        const pageHtml = await fetchWithRetry(link.url);
        const page$ = cheerio.load(pageHtml);
        
        const title = page$('h1').first().text().trim() || link.title;
        const bodyHtml = page$('article').html() || page$('.prose').html() || '';
        
        if (bodyHtml) {
          articles.push({
            id: `vercel_${Buffer.from(link.url).toString('base64url')}`,
            title,
            description: page$('meta[name="description"]').attr('content') || title,
            url: link.url,
            tags: ['vercel', 'nextjs', 'frontend', 'deployment'],
            user: { name: 'Vercel', username: 'vercel' },
            published_at: new Date().toISOString(),
            positive_reactions_count: 0,
            reading_time_minutes: estimateReadingTime(page$.text()),
            body_html: bodyHtml,
            cover_image: page$('meta[property="og:image"]').attr('content'),
          });
        }
        
        await new Promise(r => setTimeout(r, 1000));
      } catch (error: any) {
        console.warn(`[Vercel Blog] 抓取失败: ${link.url} - ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('[Vercel Blog] 爬取失败:', error.message);
  }
  
  console.log(`[Vercel Blog] 完成，共 ${articles.length} 篇文章`);
  return articles;
}

/**
 * Cloudflare Blog 爬虫
 */
export async function fetchCloudflareBlog(): Promise<WebArticle[]> {
  console.log('[Cloudflare Blog] 开始爬取...');
  const articles: WebArticle[] = [];
  
  try {
    const html = await fetchWithRetry('https://blog.cloudflare.com/');
    const $ = cheerio.load(html);
    
    // 提取文章链接
    const links: { title: string; url: string }[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).find('h2, h3').first().text().trim();
      if (href && href.startsWith('https://blog.cloudflare.com/') && text) {
        if (!links.find(l => l.url === href) && text.length > 10) {
          links.push({ title: text, url: href });
        }
      }
    });
    
    const uniqueLinks = [...new Map(links.map(l => [l.url, l])).values()].slice(0, 15);
    console.log(`[Cloudflare Blog] 发现 ${uniqueLinks.length} 篇文章`);
    
    for (const link of uniqueLinks) {
      try {
        console.log(`[Cloudflare Blog] 抓取详情: ${link.url}`);
        const pageHtml = await fetchWithRetry(link.url);
        const page$ = cheerio.load(pageHtml);
        
        const title = page$('h1').first().text().trim() || link.title;
        const bodyHtml = page$('.post-body').html() || page$('article').html() || '';
        
        if (bodyHtml) {
          articles.push({
            id: `cloudflare_${Buffer.from(link.url).toString('base64url')}`,
            title,
            description: page$('meta[name="description"]').attr('content') || title,
            url: link.url,
            tags: ['cloudflare', 'cdn', 'edge-computing', 'devops'],
            user: { name: 'Cloudflare', username: 'cloudflare' },
            published_at: new Date().toISOString(),
            positive_reactions_count: 0,
            reading_time_minutes: estimateReadingTime(page$.text()),
            body_html: bodyHtml,
            cover_image: page$('meta[property="og:image"]').attr('content'),
          });
        }
        
        await new Promise(r => setTimeout(r, 1000));
      } catch (error: any) {
        console.warn(`[Cloudflare Blog] 抓取失败: ${link.url} - ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('[Cloudflare Blog] 爬取失败:', error.message);
  }
  
  console.log(`[Cloudflare Blog] 完成，共 ${articles.length} 篇文章`);
  return articles;
}

/**
 * InfoQ 架构专栏爬虫
 */
export async function fetchInfoQ(): Promise<WebArticle[]> {
  console.log('[InfoQ] 开始爬取...');
  const articles: WebArticle[] = [];
  
  try {
    const html = await fetchWithRetry('https://www.infoq.com/architecture-design/');
    const $ = cheerio.load(html);
    
    // 提取文章链接
    const links: { title: string; url: string }[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).find('h2, h3, .content-title').first().text().trim();
      if (href && href.startsWith('/articles/') && text) {
        const fullUrl = `https://www.infoq.com${href}`;
        if (!links.find(l => l.url === fullUrl)) {
          links.push({ title: text, url: fullUrl });
        }
      }
    });
    
    const uniqueLinks = [...new Map(links.map(l => [l.url, l])).values()].slice(0, 15);
    console.log(`[InfoQ] 发现 ${uniqueLinks.length} 篇文章`);
    
    for (const link of uniqueLinks) {
      try {
        console.log(`[InfoQ] 抓取详情: ${link.url}`);
        const pageHtml = await fetchWithRetry(link.url);
        const page$ = cheerio.load(pageHtml);
        
        const title = page$('h1').first().text().trim() || link.title;
        const bodyHtml = page$('.article-content').html() || page$('article').html() || '';
        
        if (bodyHtml) {
          articles.push({
            id: `infoq_${Buffer.from(link.url).toString('base64url')}`,
            title,
            description: page$('meta[name="description"]').attr('content') || title,
            url: link.url,
            tags: ['infoq', 'architecture', 'enterprise'],
            user: { name: 'InfoQ', username: 'infoq' },
            published_at: new Date().toISOString(),
            positive_reactions_count: 0,
            reading_time_minutes: estimateReadingTime(page$.text()),
            body_html: bodyHtml,
            cover_image: page$('meta[property="og:image"]').attr('content'),
          });
        }
        
        await new Promise(r => setTimeout(r, 1500));
      } catch (error: any) {
        console.warn(`[InfoQ] 抓取失败: ${link.url} - ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('[InfoQ] 爬取失败:', error.message);
  }
  
  console.log(`[InfoQ] 完成，共 ${articles.length} 篇文章`);
  return articles;
}

/**
 * Anthropic Cookbook (GitHub) 爬虫
 * 抓取 GitHub 仓库的 README 和文档
 */
export async function fetchAnthropicCookbook(): Promise<WebArticle[]> {
  console.log('[Anthropic Cookbook] 开始爬取...');
  const articles: WebArticle[] = [];
  
  const repoUrl = 'https://github.com/anthropics/anthropic-cookbook';
  const apiUrl = 'https://api.github.com/repos/anthropics/anthropic-cookbook/contents';
  
  try {
    // 获取仓库目录结构
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodcompassKB/1.0',
      },
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API 错误: ${response.status}`);
    }
    
    const contents = await response.json() as Array<{ name: string; path: string; type: string; html_url: string }>;
    
    // 过滤 markdown 文件
    const mdFiles = contents.filter(f => f.name.endsWith('.md') && f.type === 'file').slice(0, 15);
    console.log(`[Anthropic Cookbook] 发现 ${mdFiles.length} 个文档`);
    
    for (const file of mdFiles) {
      try {
        console.log(`[Anthropic Cookbook] 抓取: ${file.html_url}`);
        
        // 获取原始内容
        const rawUrl = `https://raw.githubusercontent.com/anthropics/anthropic-cookbook/main/${file.path}`;
        const markdown = await fetchWithRetry(rawUrl);
        
        if (markdown && markdown.length > 100) {
          const title = file.name.replace('.md', '').replace(/-/g, ' ');
          articles.push({
            id: `anthropic_${Buffer.from(file.html_url).toString('base64url')}`,
            title: `Anthropic Cookbook: ${title}`,
            description: title,
            url: file.html_url,
            tags: ['anthropic', 'claude', 'prompt-engineering', 'ai'],
            user: { name: 'Anthropic', username: 'anthropic' },
            published_at: new Date().toISOString(),
            positive_reactions_count: 0,
            reading_time_minutes: estimateReadingTime(markdown),
            body_markdown: markdown,
            cover_image: 'https://www.anthropic.com/img/anthropic-logo.png',
          });
        }
        
        await new Promise(r => setTimeout(r, 1000));
      } catch (error: any) {
        console.warn(`[Anthropic Cookbook] 抓取失败: ${file.path} - ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('[Anthropic Cookbook] 爬取失败:', error.message);
  }
  
  console.log(`[Anthropic Cookbook] 完成，共 ${articles.length} 篇文章`);
  return articles;
}

/**
 * 将所有 WebArticle 转换为与 DevToArticle 兼容的格式
 */
export function webArticleToDevToFormat(article: WebArticle): any {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    url: article.url,
    tags: article.tags,
    user: article.user,
    published_at: article.published_at,
    positive_reactions_count: article.positive_reactions_count,
    reading_time_minutes: article.reading_time_minutes,
    body_html: article.body_html,
    body_markdown: article.body_markdown,
    cover_image: article.cover_image,
    // 标识非 Dev.to 数据源
    _isWebArticle: true,
  };
}
