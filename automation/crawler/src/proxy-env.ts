/**
 * docs/Codcompass 爬虫系统 2.0：本地控制中心 —— 通过 HTTP_PROXY / HTTPS_PROXY 走 Clash/Surge。
 */
export async function enableHttpProxyFromEnv(): Promise<void> {
  const proxyUrl = process.env.HTTP_PROXY?.trim() || process.env.HTTPS_PROXY?.trim();
  if (!proxyUrl) return;

  try {
    const { setGlobalDispatcher, ProxyAgent } = await import('undici');
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
    console.log('[本地 Runner · 代理] 已启用:', proxyUrl);
  } catch (e) {
    console.warn('[本地 Runner · 代理] 初始化失败（将直连）:', e);
  }
}
