/**
 * 本地爬虫控制台：默认仅开发环境开启；生产需 ENABLE_LOCAL_CRAWLER_UI=true
 */
export function isLocalCrawlerUiEnabled(): boolean {
  if (process.env.ENABLE_LOCAL_CRAWLER_UI === 'true') return true;
  if (process.env.NODE_ENV === 'development') return true;
  return false;
}

export function assertLocalCrawlerUiEnabled(): void {
  if (!isLocalCrawlerUiEnabled()) {
    const err = new Error('LOCAL_CRAWLER_UI_DISABLED');
    (err as Error & { statusCode?: number }).statusCode = 404;
    throw err;
  }
}

/** API：可选密钥 LOCAL_CRAWLER_UI_SECRET；未设置时仅依赖 isLocalCrawlerUiEnabled */
export function authorizeLocalCrawlerApi(req: { headers: Headers }): boolean {
  const required = process.env.LOCAL_CRAWLER_UI_SECRET?.trim();
  if (!required) return true;
  return req.headers.get('x-local-crawler-secret') === required;
}
