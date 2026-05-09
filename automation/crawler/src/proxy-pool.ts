/**
 * 代理池模块 - 支持多个代理出口，自动轮换和故障转移
 * 
 * 配置方式：
 * - PROXY_POOL_URLS: 逗号分隔的代理 URL 列表，如 "http://proxy1:7890,http://proxy2:7890,http://proxy3:7890"
 * - 如果未设置，回退到 HTTP_PROXY / HTTPS_PROXY
 * 
 * 功能：
 * - 轮询（Round-Robin）分配代理
 * - 请求失败时自动切换到下一个代理
 * - 健康检查标记不可用代理
 */

import { setGlobalDispatcher, ProxyAgent, getGlobalDispatcher } from 'undici';

type ProxyEntry = {
  url: string;
  failedCount: number;
  lastFailedAt: number;
  isHealthy: boolean;
};

const RECOVERY_TIMEOUT_MS = 5 * 60 * 1000; // 5 分钟后恢复不健康代理
const MAX_FAIL_BEFORE_MARK_UNHEALTHY = 3;

let proxyPool: ProxyEntry[] = [];
let currentIndex = 0;
let isInitialized = false;

/**
 * 初始化代理池
 * 从环境变量读取代理列表
 */
export function initProxyPool(): void {
  proxyPool = [];
  currentIndex = 0;

  const poolUrls = process.env.PROXY_POOL_URLS?.trim();
  
  if (poolUrls) {
    // 从 PROXY_POOL_URLS 读取多个代理
    const urls = poolUrls
      .split(/[,，]+/)
      .map(u => u.trim())
      .filter(Boolean);
    
    for (const url of urls) {
      proxyPool.push({
        url,
        failedCount: 0,
        lastFailedAt: 0,
        isHealthy: true,
      });
    }
    
    console.log(`[代理池] 已初始化 ${proxyPool.length} 个代理: ${proxyPool.map(p => p.url).join(', ')}`);
  } else {
    // 回退到单个 HTTP_PROXY / HTTPS_PROXY
    const fallbackUrl = process.env.HTTP_PROXY?.trim() || process.env.HTTPS_PROXY?.trim();
    if (fallbackUrl) {
      proxyPool.push({
        url: fallbackUrl,
        failedCount: 0,
        lastFailedAt: 0,
        isHealthy: true,
      });
      console.log(`[代理池] 使用回退代理: ${fallbackUrl}`);
    } else {
      console.log('[代理池] 未配置代理，将直连');
    }
  }

  isInitialized = true;
}

/**
 * 获取下一个可用的代理 URL
 * 使用轮询策略，跳过不健康的代理
 */
export function getNextProxyUrl(): string | null {
  if (proxyPool.length === 0) return null;

  // 如果只有一个代理，直接返回
  if (proxyPool.length === 1) {
    const entry = proxyPool[0];
    // 检查是否可以恢复
    if (!entry.isHealthy && Date.now() - entry.lastFailedAt > RECOVERY_TIMEOUT_MS) {
      entry.isHealthy = true;
      entry.failedCount = 0;
      console.log(`[代理池] 代理已自动恢复: ${entry.url}`);
    }
    return entry.url;
  }

  // 轮询查找健康代理
  const startIdx = currentIndex;
  let attempts = 0;
  
  while (attempts < proxyPool.length) {
    const idx = (startIdx + attempts) % proxyPool.length;
    const entry = proxyPool[idx];
    
    // 检查是否可以恢复
    if (!entry.isHealthy && Date.now() - entry.lastFailedAt > RECOVERY_TIMEOUT_MS) {
      entry.isHealthy = true;
      entry.failedCount = 0;
      console.log(`[代理池] 代理已自动恢复: ${entry.url}`);
    }
    
    if (entry.isHealthy) {
      currentIndex = (idx + 1) % proxyPool.length;
      return entry.url;
    }
    
    attempts++;
  }

  // 所有代理都不健康，返回第一个（让它重试）
  console.warn('[代理池] 所有代理均不健康，返回第一个代理重试');
  return proxyPool[0].url;
}

/**
 * 标记代理请求失败
 */
export function markProxyFailed(proxyUrl: string): void {
  const entry = proxyPool.find(p => p.url === proxyUrl);
  if (!entry) return;

  entry.failedCount++;
  entry.lastFailedAt = Date.now();

  if (entry.failedCount >= MAX_FAIL_BEFORE_MARK_UNHEALTHY) {
    entry.isHealthy = false;
    console.warn(`[代理池] 代理标记为不健康: ${entry.url} (失败 ${entry.failedCount} 次)`);
  } else {
    console.log(`[代理池] 代理请求失败: ${entry.url} (失败 ${entry.failedCount}/${MAX_FAIL_BEFORE_MARK_UNHEALTHY} 次)`);
  }
}

/**
 * 标记代理请求成功（重置失败计数）
 */
export function markProxySuccess(proxyUrl: string): void {
  const entry = proxyPool.find(p => p.url === proxyUrl);
  if (!entry) return;

  if (entry.failedCount > 0) {
    console.log(`[代理池] 代理请求成功，重置计数: ${entry.url}`);
  }
  entry.failedCount = 0;
  entry.isHealthy = true;
}

/**
 * 设置全局代理 dispatcher
 * 使用指定的代理 URL
 */
export async function setGlobalProxy(proxyUrl: string): Promise<void> {
  try {
    const dispatcher = new ProxyAgent(proxyUrl);
    setGlobalDispatcher(dispatcher);
  } catch (e) {
    console.warn(`[代理池] 设置代理失败: ${proxyUrl}`, e);
  }
}

/**
 * 获取代理池状态
 */
export function getProxyPoolStatus(): {
  total: number;
  healthy: number;
  unhealthy: number;
  entries: Array<{ url: string; isHealthy: boolean; failedCount: number }>;
} {
  const healthy = proxyPool.filter(p => p.isHealthy).length;
  return {
    total: proxyPool.length,
    healthy,
    unhealthy: proxyPool.length - healthy,
    entries: proxyPool.map(p => ({
      url: p.url,
      isHealthy: p.isHealthy,
      failedCount: p.failedCount,
    })),
  };
}

/**
 * 重置代理池状态（手动恢复所有代理）
 */
export function resetProxyPool(): void {
  for (const entry of proxyPool) {
    entry.failedCount = 0;
    entry.isHealthy = true;
    entry.lastFailedAt = 0;
  }
  currentIndex = 0;
  console.log('[代理池] 已重置所有代理状态');
}
