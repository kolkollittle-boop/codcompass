/**
 * 方案 3：正文深度清洗 —— Mozilla Readability 提取主内容 HTML（再交由 Turndown 转 Markdown）。
 */
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export function extractReadabilityContentHtml(html: string, pageUrl: string): string | null {
  try {
    const dom = new JSDOM(html, { url: pageUrl });
    const doc = dom.window.document;
    const reader = new Readability(doc);
    const article = reader.parse();
    return article?.content ?? null;
  } catch {
    return null;
  }
}
