/**
 * Content Extractor — fetch, extract, and clean article content from URLs
 *
 * Uses cheerio for DOM parsing and cleaning. Produces clean HTML
 * ready for database insertion (no Markdown leakage).
 *
 * Pipeline: fetch → parse → extract main content → clean → normalize
 */

import * as https from 'https';
import * as http from 'http';
import { load } from 'cheerio';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

export interface ExtractedArticle {
  title: string;
  content: string;       // Clean HTML
  excerpt: string;
  author: string;
  publishedDate: string | null;
  tags: string[];
  image: string | null;  // Featured image URL
  wordCount: number;
  readTime: number;      // Minutes
}

interface FetchOptions {
  proxy?: string;
  userAgent?: string;
  timeout?: number;
}

// ── HTTP Fetch with proxy support ──────────────────────────────────────────────

async function fetchHtml(url: string, options: FetchOptions = {}): Promise<string> {
  const { proxy, userAgent = 'Mozilla/5.0 (compatible; CyberpunkWebBot/1.0)', timeout = 15000 } = options;

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const reqOptions: any = {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout,
    };

    if (proxy) {
      reqOptions.agent = urlObj.protocol === 'https:'
        ? new HttpsProxyAgent(proxy)
        : new HttpProxyAgent(proxy);
    }

    const req = lib.get(url, reqOptions, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const location = res.headers.location;
        if (location) {
          fetchHtml(new URL(location, url).toString(), options)
            .then(resolve)
            .catch(reject);
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });
  });
}

// ── Content Extraction ──────────────────────────────────────────────────────

/**
 * Extract article content from raw HTML.
 * Uses heuristics to find the main content area and clean it.
 */
export async function extractArticle(html: string, baseUrl: string): Promise<ExtractedArticle> {
  const $ = load(html);

  // Remove unwanted elements
  $('script, style, noscript, iframe, svg, nav, footer, header, aside').remove();
  $('[class*="nav"], [class*="footer"], [class*="sidebar"], [class*="ad-"], [class*="advert"], [class*="comment"], [class*="share"], [class*="social"], [class*="cookie"]').remove();

  // Try to find main content container
  let contentSelector = 'article, [role="article"], main, .post-content, .entry-content, .article-body, .content-body, .post-body, #content, .article-content';
  let $content = $(contentSelector);

  // Fallback: use <body> if no specific container found
  if ($content.length === 0) {
    $content = $('body');
  }

  // Extract metadata
  const title = extractTitle($);
  const author = extractAuthor($);
  const publishedDate = extractDate($);
  const tags = extractTags($);
  const image = extractFeaturedImage($, baseUrl);
  const excerpt = generateExcerpt($content.text(), 200);

  // Clean and normalize content
  const content = cleanContent($, contentSelector, baseUrl);
  const wordCount = countWords($content.text());
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 words/min

  return {
    title,
    content,
    excerpt,
    author,
    publishedDate,
    tags,
    image,
    wordCount,
    readTime,
  };
}

/**
 * Fetch URL and extract article in one call.
 */
export async function extractArticleFromUrl(url: string, options?: FetchOptions): Promise<ExtractedArticle> {
  const html = await fetchHtml(url, options);
  return extractArticle(html, url);
}

// ── Metadata Extraction Helpers ─────────────────────────────────────────────

function extractTitle($: ReturnType<typeof load>): string {
  // Try og:title first
  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (ogTitle) return ogTitle.trim();

  // Try meta title
  const metaTitle = $('meta[name="title"]').attr('content');
  if (metaTitle) return metaTitle.trim();

  // Try <h1>
  const h1 = $('h1').first().text().trim();
  if (h1 && h1.length > 3) return h1;

  // Fallback to <title>
  return $('title').text().trim().replace(/\s*[-|].*$/, '').trim();
}

function extractAuthor($: ReturnType<typeof load>): string {
  // Try meta author
  const metaAuthor = $('meta[name="author"]').attr('content');
  if (metaAuthor) return metaAuthor.trim();

  // Try rel="author"
  const relAuthor = $('a[rel="author"]').first().text().trim();
  if (relAuthor) return relAuthor;

  // Try structured data
  const jsonLd = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLd.length; i++) {
    try {
      const data = JSON.parse(jsonLd.eq(i).text());
      if (data.author) {
        return typeof data.author === 'string' ? data.author : data.author.name || '';
      }
    } catch { /* skip */ }
  }

  return '';
}

function extractDate($: ReturnType<typeof load>): string | null {
  // Try meta publish date
  const metaDate = $('meta[property="article:published_time"]').attr('content');
  if (metaDate) return metaDate;

  // Try time element
  const timeAttr = $('time[datetime]').attr('datetime');
  if (timeAttr) return timeAttr;

  // Try JSON-LD
  const jsonLd = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLd.length; i++) {
    try {
      const data = JSON.parse(jsonLd.eq(i).text());
      if (data.datePublished) return data.datePublished;
    } catch { /* skip */ }
  }

  return null;
}

function extractTags($: ReturnType<typeof load>): string[] {
  const tags: string[] = [];

  // Try meta keywords
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  if (metaKeywords) {
    tags.push(...metaKeywords.split(',').map((t) => t.trim()).filter(Boolean));
  }

  // Try article tags
  $('[class*="tag"], [class*="label"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 30) tags.push(text);
  });

  // Try rel="tag"
  $('a[rel="tag"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) tags.push(text);
  });

  return [...new Set(tags)];
}

function extractFeaturedImage($: ReturnType<typeof load>, baseUrl: string): string | null {
  // Try og:image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) return new URL(ogImage, baseUrl).toString();

  // Try twitter:image
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage) return new URL(twitterImage, baseUrl).toString();

  // Try first large image in content
  let img: string | null = null;
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('emoji') && !src.includes('icon') && !src.includes('logo') && !src.includes('avatar')) {
      img = new URL(src, baseUrl).toString();
      return false; // break
    }
  });

  return img;
}

function generateExcerpt(text: string, maxLength: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).replace(/\s\w+$/, '') + '...';
}

// ── Content Cleaning ────────────────────────────────────────────────────────

function cleanContent($: ReturnType<typeof load>, selector: string, baseUrl: string): string {
  const $content = $(selector);

  // Remove empty elements
  $content.find('*').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const children = $el.children().length;
    if (!text && !children && !$el.find('img, iframe, video, audio, code, pre').length) {
      $el.remove();
    }
  });

  // Fix relative URLs
  $content.find('a[href]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      $el.attr('href', new URL(href, baseUrl).toString());
    }
  });

  // Fix relative image URLs
  $content.find('img[src]').each((_, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      $el.attr('src', new URL(src, baseUrl).toString());
    }
    // Add loading="lazy"
    if (!$el.attr('loading')) {
      $el.attr('loading', 'lazy');
    }
  });

  // Clean up classes and styles (keep only semantic HTML)
  $content.find('*').each((_, el) => {
    const $el = $(el);
    $el.removeAttr('class');
    $el.removeAttr('style');
    $el.removeAttr('onclick');
    $el.removeAttr('onload');
    $el.removeAttr('data-*');
  });

  // Remove inline event handlers
  $content.find('*').each((_, el) => {
    const $el = $(el);
    $el.removeAttr('onclick').removeAttr('onload').removeAttr('onerror');
  });

  // Get inner HTML
  let html = $content.html() || '';

  // Clean up whitespace
  html = html.replace(/\n\s*\n/g, '\n').replace(/ {2,}/g, ' ').trim();

  return html;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

// ── Slug Generation ─────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// ── Category Matching ───────────────────────────────────────────────────────

export interface CategoryInfo {
  slug: string;
  name: string;
  keywords: string[];
}

export function matchCategory(title: string, content: string, categories: CategoryInfo[]): string | null {
  const text = `${title} ${content}`.toLowerCase();

  // Score each category by keyword matches
  const scores = categories.map((cat) => {
    const score = cat.keywords.reduce((acc, kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = text.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);
    return { slug: cat.slug, score };
  });

  // Return highest scoring category (if any matches)
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.score > 0 ? scores[0].slug : null;
}
