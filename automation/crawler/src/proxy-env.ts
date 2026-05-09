/**
 * docs/Codcompass 爬虫系统 2.0：本地控制中心 —— 通过 HTTP_PROXY / HTTPS_PROXY 走 Clash/Surge。
 * 
 * 更新：支持代理池轮换（PROXY_POOL_URLS）
 */
import { initProxyPool, getNextProxyUrl, setGlobalProxy, markProxySuccess, markProxyFailed, getProxyPoolStatus } from './proxy-pool';

let proxyPoolInitialized = false;

/**
 * 初始化代理池（仅在爬虫启动时调用一次）
 */
export function initProxyPoolOnce(): void {
  if (!proxyPoolInitialized) {
    initProxyPool();
    proxyPoolInitialized = true;
  }
}

/**
 * 启用代理（兼容旧版单代理模式）
 * 如果配置了 PROXY_POOL_URLS，则使用代理池；否则使用 HTTP_PROXY / HTTPS_PROXY
 */
export async function enableHttpProxyFromEnv(): Promise<void> {
  // 先初始化代理池
  initProxyPoolOnce();

  const proxyUrl = getNextProxyUrl();
  if (!proxyUrl) {
    console.log('[本地 Runner · 代理] 未配置代理，将直连');
    return;
  }

  try {
    await setGlobalProxy(proxyUrl);
    console.log('[本地 Runner · 代理] 已启用:', proxyUrl);
  } catch (e) {
    console.warn('[本地 Runner · 代理] 初始化失败（将直连）:', e);
  }
}

/**
 * 带代理轮换的 fetch 包装器
 * 请求失败时自动切换代理重试
 */
export async function fetchWithProxyRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const proxyUrl = getNextProxyUrl();
    
    // 设置当前代理
    if (proxyUrl) {
      await setGlobalProxy(proxyUrl);
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(30000),
      });

      // 请求成功，标记代理健康
      if (proxyUrl) {
        markProxySuccess(proxyUrl);
      }

      return response;
    } catch (error: any) {
      lastError = error;
      
      // 标记代理失败
      if (proxyUrl) {
        markProxyFailed(proxyUrl);
      }

      console.warn(
        `[代理轮换] 请求失败 (${attempt}/${maxRetries}): ${url} - ${error.message}` +
        (proxyUrl ? ` (代理: ${proxyUrl})` : '')
      );

      if (attempt < maxRetries) {
        // 等待后重试（指数退避）
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error('请求失败');
}

/**
 * 获取代理池状态（用于调试）
 */
export { getProxyPoolStatus };
