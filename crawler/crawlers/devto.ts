/**
 * Dev.to Crawler
 * 
 * Uses Dev.to REST API to fetch articles
 */

import { BaseCrawler, CrawlResult } from '../lib/base-crawler';

export interface DevToArticle {
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
}

export class DevToCrawler extends BaseCrawler {
  constructor() {
    super({
      region: 'any',  // Dev.to API doesn't need proxy
      timeout: 15000,
      retries: 3,
      userAgent: 'CodcompassKB/1.0 (educational crawler)',
    });
  }

  async crawl(url: string): Promise<CrawlResult> {
    console.log(`[DevToCrawler] 开始爬取：${url}`);
    
    const result = await this.fetchWithProxy(url);
    
    if (!result.success || !result.content) {
      return result;
    }

    // 解析内容
    const articles = await this.parse(result.content);
    
    console.log(`[DevToCrawler] 解析到 ${articles.length} 篇文章`);
    
    // 将解析结果附加到 result
    (result as any).data = articles;
    
    return result;
  }

  async parse(content: string): Promise<DevToArticle[]> {
    const articles: DevToArticle[] = JSON.parse(content);
    
    return articles.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      url: a.url,
      tags: a.tags || [],
      user: a.user,
      published_at: a.published_at,
      positive_reactions_count: a.positive_reactions_count,
      reading_time_minutes: a.reading_time_minutes,
    }));
  }

  /**
   * 获取热门文章
   */
  async getPopularArticles(tags = ['javascript', 'typescript', 'react'], limit = 10): Promise<DevToArticle[]> {
    const allArticles: DevToArticle[] = [];
    
    for (const tag of tags) {
      const url = `https://dev.to/api/articles?tag=${tag}&per_page=${limit}&sort_by=public_reactions_count`;
      const result = await this.crawl(url);
      
      if (result.success && (result as any).data) {
        allArticles.push(...(result as any).data);
      }
      
      // Dev.to 速率限制
      await this.sleep(1000);
    }
    
    return allArticles;
  }
}

// 使用示例
async function main() {
  const crawler = new DevToCrawler();
  
  const articles = await crawler.getPopularArticles(['javascript', 'typescript'], 5);
  
  console.log(`\n✅ 获取到 ${articles.length} 篇热门文章:`);
  articles.slice(0, 10).forEach((article, i) => {
    console.log(`\n${i + 1}. ${article.title}`);
    console.log(`   作者: ${article.user.name}`);
    console.log(`   标签: ${article.tags.join(', ')}`);
    console.log(`   反应: ${article.positive_reactions_count}`);
  });
  
  // 输出代理池状态
  console.log('\n📊 代理池统计:');
  console.log(crawler.getProxyStatus());
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}
