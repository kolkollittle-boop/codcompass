/**
 * 爬虫基类
 * 
 * 提供代理支持、速率限制、错误处理
 */

import { Agent } from 'http';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getProxyPool } from './proxy-pool';
import { SITE_CONFIGS, RATE_LIMITS } from '../config/proxy-config';

export interface CrawlResult {
  url: string;
  success: boolean;
  statusCode?: number;
  content?: string;
  error?: string;
  responseTime: number;
  proxyNode?: string;
}

export interface CrawlerOptions {
  timeout?: number;
  retries?: number;
  userAgent?: string;
  region?: 'us' | 'eu' | 'asia' | 'any';
}

export abstract class BaseCrawler {
  protected proxyPool = getProxyPool();
  protected userAgent: string;
  protected timeout: number;
  protected maxRetries: number;
  protected region: 'us' | 'eu' | 'asia' | 'any';

  // 速率限制
  private lastRequestTime = 0;
  private requestCount = 0;

  constructor(options: CrawlerOptions = {}) {
    this.userAgent = 
      options.userAgent || 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.retries || RATE_LIMITS.maxRetries;
    this.region = options.region || 'any';
  }

  /**
   * 获取站点特定配置
   */
  protected getSiteConfig(url: string): any {
    const hostname = new URL(url).hostname;
    
    for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
      if (hostname.includes(domain)) {
        return config;
      }
    }

    return {
      priority: 'any',
      rateLimit: {
        requestsPerMinute: 10,
        delay: [3, 6],
      },
    };
  }

  /**
   * 速率限制延迟
   */
  private async rateLimitDelay(url: string): Promise<void> {
    const config = this.getSiteConfig(url);
    const [minDelay, maxDelay] = config.rateLimit?.delay || [3, 6];
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < delay * 1000) {
      const waitTime = delay * 1000 - elapsed;
      console.log(`[Crawler] 速率限制延迟：${(waitTime / 1000).toFixed(2)}s`);
      await this.sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * 获取代理 Agent
   */
  private async getProxyAgent(): Promise<Agent | undefined> {
    const proxyUrl = await this.proxyPool.getProxyUrl(this.region);
    
    if (!proxyUrl) {
      console.warn('[Crawler] 无法获取代理，使用直连');
      return undefined;
    }

    return {
      httpAgent: new HttpProxyAgent(proxyUrl),
      httpsAgent: new HttpsProxyAgent(proxyUrl),
    } as any;
  }

  /**
   * 执行 HTTP 请求 (带代理和重试)
   */
  protected async fetchWithProxy(
    url: string,
    options: RequestInit = {}
  ): Promise<CrawlResult> {
    const siteConfig = this.getSiteConfig(url);
    let lastError: any;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // 速率限制
        await this.rateLimitDelay(url);

        // 获取代理节点
        const proxyNode = await this.proxyPool.getProxy(siteConfig.priority);
        const agents = await this.getProxyAgent();

        const startTime = Date.now();

        console.log(`[Crawler] 请求：${url} (尝试 ${attempt + 1}/${this.maxRetries})`);

        const response = await fetch(url, {
          ...options,
          agent: agents?.httpsAgent || agents?.httpAgent,
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            ...options.headers,
          },
          signal: AbortSignal.timeout(this.timeout),
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();

        // 报告成功
        if (proxyNode) {
          this.proxyPool.reportSuccess(proxyNode, responseTime);
        }

        return {
          url,
          success: true,
          statusCode: response.status,
          content,
          responseTime,
          proxyNode: proxyNode || undefined,
        };

      } catch (error: any) {
        lastError = error;
        console.error(`[Crawler] 请求失败：${error.message}`);

        // 报告失败
        const proxyNode = await this.proxyPool.getProxy(siteConfig.priority);
        if (proxyNode) {
          this.proxyPool.reportFailure(proxyNode, error);
        }

        // 非重试错误，直接返回
        if (error.name === 'AbortError') {
          return {
            url,
            success: false,
            error: '请求超时',
            responseTime: this.timeout,
          };
        }

        // 等待后重试
        if (attempt < this.maxRetries - 1) {
          const waitTime = RATE_LIMITS.retryDelay * (attempt + 1);
          console.log(`[Crawler] ${waitTime}ms 后重试...`);
          await this.sleep(waitTime);
        }
      }
    }

    // 所有重试失败
    return {
      url,
      success: false,
      error: lastError?.message || '未知错误',
      responseTime: 0,
    };
  }

  /**
   * 抽象方法：爬取实现
   */
  abstract crawl(url: string): Promise<CrawlResult>;

  /**
   * 抽象方法：解析内容
   */
  abstract parse(content: string): Promise<any>;

  /**
   * 工具：睡眠
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取代理池状态
   */
  getProxyStatus() {
    return this.proxyPool.getStats();
  }
}
