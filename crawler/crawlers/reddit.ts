/**
 * Reddit Crawler
 * 
 * Uses Reddit JSON API to fetch posts from programming subreddits
 */

import { BaseCrawler, CrawlResult } from '../lib/base-crawler';

export interface RedditPost {
  title: string;
  url: string;
  subreddit: string;
  score: number;
  author: string;
  created_utc: number;
  selftext?: string;
}

export class RedditCrawler extends BaseCrawler {
  constructor() {
    super({
      region: 'us',  // Reddit needs US proxy
      timeout: 30000,
      retries: 3,
      userAgent: 'CodcompassKB/1.0 (educational crawler)',
    });
  }

  async crawl(url: string): Promise<CrawlResult> {
    console.log(`[RedditCrawler] 开始爬取：${url}`);
    
    const result = await this.fetchWithProxy(url);
    
    if (!result.success || !result.content) {
      return result;
    }

    // 解析内容
    const posts = await this.parse(result.content);
    
    console.log(`[RedditCrawler] 解析到 ${posts.length} 个帖子`);
    
    // 将解析结果附加到 result
    (result as any).data = posts;
    
    return result;
  }

  async parse(content: string): Promise<RedditPost[]> {
    const data = JSON.parse(content);
    const children = data.data?.children || [];
    
    return children.map((c: any) => ({
      title: c.data.title,
      url: c.data.url,
      subreddit: c.data.subreddit,
      score: c.data.score,
      author: c.data.author,
      created_utc: c.data.created_utc,
      selftext: c.data.selftext,
    }));
  }

  /**
   * 获取热门帖子
   */
  async getHotPosts(subreddits = ['programming', 'webdev', 'devops'], limit = 25): Promise<RedditPost[]> {
    const allPosts: RedditPost[] = [];
    
    for (const sub of subreddits) {
      const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`;
      const result = await this.crawl(url);
      
      if (result.success && (result as any).data) {
        allPosts.push(...(result as any).data);
      }
      
      // Reddit 速率限制
      await this.sleep(2000);
    }
    
    return allPosts;
  }
}

// 使用示例
async function main() {
  const crawler = new RedditCrawler();
  
  const posts = await crawler.getHotPosts(['programming', 'webdev'], 10);
  
  console.log(`\n✅ 获取到 ${posts.length} 个热门帖子:`);
  posts.slice(0, 10).forEach((post, i) => {
    console.log(`\n${i + 1}. ${post.title}`);
    console.log(`   子版块: r/${post.subreddit}`);
    console.log(`   分数: ${post.score}`);
    console.log(`   作者: ${post.author}`);
  });
  
  // 输出代理池状态
  console.log('\n📊 代理池统计:');
  console.log(crawler.getProxyStatus());
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}
