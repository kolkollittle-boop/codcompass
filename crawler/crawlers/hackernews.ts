/**
 * Hacker News Crawler
 * 
 * Uses Firebase REST API to fetch top stories
 */

import { BaseCrawler, CrawlResult } from '../lib/base-crawler';

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  type: string;
}

export class HackerNewsCrawler extends BaseCrawler {
  private readonly HN_API = 'https://hacker-news.firebaseio.com/v0';

  constructor() {
    super({
      region: 'any',  // HN API doesn't need proxy
      timeout: 15000,
      retries: 3,
      userAgent: 'CodcompassKB/1.0 (educational crawler)',
    });
  }

  async crawl(url: string): Promise<CrawlResult> {
    console.log(`[HackerNewsCrawler] 开始爬取：${url}`);
    
    const result = await this.fetchWithProxy(url);
    
    if (!result.success || !result.content) {
      return result;
    }

    // 解析内容
    const stories = await this.parse(result.content);
    
    console.log(`[HackerNewsCrawler] 解析到 ${stories.length} 个故事`);
    
    // 将解析结果附加到 result
    (result as any).data = stories;
    
    return result;
  }

  async parse(content: string): Promise<HNStory[]> {
    const topIds: number[] = JSON.parse(content);
    const ids = topIds.slice(0, 30);

    // 并行获取详情
    const stories = await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`${this.HN_API}/item/${id}.json`);
        return res.json() as Promise<HNStory>;
      })
    );

    return stories.filter(s => s && s.url); // 只保留有链接的
  }

  /**
   * 获取热门故事
   */
  async getTopStories(limit = 30): Promise<HNStory[]> {
    const url = `${this.HN_API}/topstories.json?print=pretty`;
    const result = await this.crawl(url);
    
    if (result.success && (result as any).data) {
      return (result as any).data.slice(0, limit);
    }
    
    return [];
  }
}

// 使用示例
async function main() {
  const crawler = new HackerNewsCrawler();
  
  const stories = await crawler.getTopStories(10);
  
  console.log(`\n✅ 获取到 ${stories.length} 个热门故事:`);
  stories.forEach((story, i) => {
    console.log(`\n${i + 1}. ${story.title}`);
    console.log(`   URL: ${story.url}`);
    console.log(`   分数: ${story.score}`);
    console.log(`   评论: ${story.descendants}`);
  });
  
  // 输出代理池状态
  console.log('\n📊 代理池统计:');
  console.log(crawler.getProxyStatus());
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}
