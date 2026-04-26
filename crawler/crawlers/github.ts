/**
 * GitHub 爬虫示例
 * 
 * 使用多节点代理爬取 GitHub Trending
 */

import { BaseCrawler, CrawlResult } from '../lib/base-crawler';
import * as cheerio from 'cheerio';

interface RepoInfo {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: string;
  forks: string;
}

export class GitHubCrawler extends BaseCrawler {
  constructor() {
    super({
      region: 'us',  // GitHub 优先使用美国节点
      timeout: 30000,
      retries: 3,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
  }

  async crawl(url: string): Promise<CrawlResult> {
    console.log(`[GitHubCrawler] 开始爬取：${url}`);
    
    const result = await this.fetchWithProxy(url);
    
    if (!result.success || !result.content) {
      return result;
    }

    // 解析内容
    const repos = await this.parse(result.content);
    
    console.log(`[GitHubCrawler] 解析到 ${repos.length} 个仓库`);
    
    // 将解析结果附加到 result
    (result as any).data = repos;
    
    return result;
  }

  async parse(content: string): Promise<RepoInfo[]> {
    const $ = cheerio.load(content);
    const repos: RepoInfo[] = [];

    // GitHub Trending 页面结构
    $('article.Box-row').each((_, element) => {
      const name = $(element).find('h2 a').text().trim();
      const url = 'https://github.com' + $(element).find('h2 a').attr('href');
      const description = $(element).find('p').text().trim();
      const language = $(element).find('[itemprop="programmingLanguage"]').text().trim();
      const stars = $(element).find('[aria-label="stars"]').text().trim();
      const forks = $(element).find('[aria-label="forks"]').text().trim();

      if (name) {
        repos.push({
          name,
          url: url || '',
          description,
          language,
          stars,
          forks,
        });
      }
    });

    return repos;
  }
}

// 使用示例
async function main() {
  const crawler = new GitHubCrawler();

  const urls = [
    'https://github.com/trending/javascript',
    'https://github.com/trending/typescript',
    'https://github.com/trending/python',
  ];

  for (const url of urls) {
    const result = await crawler.crawl(url);
    
    if (result.success) {
      console.log(`\n✅ ${url}`);
      console.log(`   响应时间：${result.responseTime}ms`);
      console.log(`   使用节点：${result.proxyNode}`);
      console.log(`   解析到 ${(result as any).data?.length || 0} 个仓库`);
    } else {
      console.log(`\n❌ ${url}`);
      console.log(`   错误：${result.error}`);
    }

    // 间隔等待
    await crawler.sleep(5000);
  }

  // 输出代理池状态
  console.log('\n📊 代理池统计:');
  console.log(crawler.getProxyStatus());
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}
