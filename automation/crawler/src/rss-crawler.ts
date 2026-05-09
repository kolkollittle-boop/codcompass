/**
 * RSS 爬虫 - 支持 arXiv、HuggingFace、InfoQ、LangChain 等 RSS 源
 *
 * 解析 RSS/Atom feed，返回 WebArticle 兼容格式
 */
import { XMLParser } from 'fast-xml-parser';
import { fetchWithProxyRetry } from './proxy-env';
import { WebArticle } from './web-crawler';

export interface RssSourceConfig {
  label: string;
  feedUrl: string;
  maxArticles?: number;
}

interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  'dc:creator'?: string;
  author?: string;
  'content:encoded'?: string;
  summary?: string;
  category?: string | string[];
  guid?: string;
}

/**
 * 解析 RSS/Atom feed
 */
async function parseRssFeed(feedUrl: string, maxArticles: number = 20): Promise<RssItem[]> {
  try {
    const response = await fetchWithProxyRetry(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    }, 2);

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: 'value',
    });

    const result = parser.parse(xmlText);

    // 处理 RSS 2.0 格式
    if (result.rss?.channel?.item) {
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];
      return items.slice(0, maxArticles);
    }

    // 处理 Atom 格式
    if (result.feed?.entry) {
      const entries = Array.isArray(result.feed.entry)
        ? result.feed.entry
        : [result.feed.entry];
      return entries.map((entry: any) => ({
        title: entry.title?.value || entry.title,
        link: entry.link?.['@_href'] || entry.link,
        description: entry.summary?.value || entry.summary || entry.content?.value,
        pubDate: entry.published || entry.updated,
        author: entry.author?.name,
        category: entry.category?.['@_term'],
      })).slice(0, maxArticles);
    }

    console.warn(`[RSS] 无法解析 feed 格式: ${feedUrl}`);
    return [];
  } catch (error: any) {
    console.warn(`[RSS] 抓取失败: ${feedUrl} - ${error.message}`);
    return [];
  }
}

/**
 * 将 RSS item 转换为 WebArticle 格式
 */
function rssItemToWebArticle(item: RssItem, sourceLabel: string): WebArticle {
  const url = item.link || '';
  const id = url || item.guid || Math.random().toString(36).substring(2);
  const tags = typeof item.category === 'string'
    ? [item.category]
    : Array.isArray(item.category)
      ? item.category.slice(0, 5)
      : [];

  return {
    id,
    title: item.title || 'Untitled',
    description: item.description?.substring(0, 200) || '',
    url,
    tags,
    user: {
      name: item['dc:creator'] || item.author || sourceLabel,
      username: item['dc:creator'] || item.author || 'unknown',
    },
    published_at: item.pubDate || new Date().toISOString(),
    positive_reactions_count: 0,
    reading_time_minutes: 5,
    body_html: item['content:encoded'] || item.description || '',
    body_markdown: item.description || '',
  };
}

/**
 * 抓取单个 RSS 源
 */
export async function fetchRssSource(config: RssSourceConfig): Promise<WebArticle[]> {
  console.log(`[RSS] 开始抓取: ${config.label} (${config.feedUrl})`);

  const items = await parseRssFeed(config.feedUrl, config.maxArticles || 20);
  console.log(`[RSS] ${config.label}: 获取 ${items.length} 篇文章`);

  return items.map(item => rssItemToWebArticle(item, config.label));
}

/**
 * 批量抓取多个 RSS 源
 */
export async function fetchMultipleRssSources(
  sources: RssSourceConfig[]
): Promise<WebArticle[]> {
  const allArticles: WebArticle[] = [];

  for (const source of sources) {
    try {
      const articles = await fetchRssSource(source);
      allArticles.push(...articles);
    } catch (error: any) {
      console.warn(`[RSS] ${source.label} 抓取失败: ${error.message}`);
    }
  }

  return allArticles;
}

// ─── 预定义的 RSS 源配置 ─────────────────────────────────────────────────────

export const PREMIUM_RSS_SOURCES: RssSourceConfig[] = [
  {
    label: 'arXiv cs.AI',
    feedUrl: 'https://rss.arxiv.org/rss/cs.AI',
    maxArticles: 30,
  },
  {
    label: 'Hugging Face Blog',
    feedUrl: 'https://huggingface.co/blog/feed.xml',
    maxArticles: 20,
  },
  {
    label: 'InfoQ Architecture',
    feedUrl: 'https://www.infoq.com/feed/architecture-design/',
    maxArticles: 20,
  },
  {
    label: 'LangChain Blog',
    feedUrl: 'https://blog.langchain.dev/rss/',
    maxArticles: 20,
  },
];
