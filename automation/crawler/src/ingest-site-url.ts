/**
 * Ingest POST 与 SimHash 预检拉列表共用根 URL。
 * 设 CRAWLER_INGEST_BASE_URL 可强制把达标内容推到指定服务器（如生产域名），
 * 与本地 Next 的 NEXT_PUBLIC_SITE_URL 解耦。
 */
export function getCrawlerIngestSiteBaseUrl(): string {
  const raw =
    process.env.CRAWLER_INGEST_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    '';
  const base = raw.replace(/\/+$/, '');
  return base || 'http://localhost:3000';
}
