import dotenv from 'dotenv';
import { getCrawlerIngestSiteBaseUrl } from './ingest-site-url.js';
import { setGlobalDispatcher, ProxyAgent, Agent } from 'undici';

// Load env
dotenv.config({ path: '../../.env.local' });

/** 初始化全局 dispatcher（支持通过 HTTP_PROXY 走 Clash） */
let dispatcherInitialized = false;
function initDispatcher(): void {
  if (dispatcherInitialized) return;
  dispatcherInitialized = true;
  const proxyUrl = process.env.HTTP_PROXY?.trim() || process.env.HTTPS_PROXY?.trim();
  if (proxyUrl) {
    console.log(`[ingest] 使用代理: ${proxyUrl}`);
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
  }
}

/** 带超时的 fetch（使用 undici dispatcher 支持代理） */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** 带重试的 fetch（最多 3 次，指数退避） */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  // 确保 dispatcher 已初始化
  initDispatcher();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, 30000);
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[fetch retry ${attempt}/${maxRetries}] failed: ${msg}`);
      if (attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error('unreachable');
}

export async function ingestArticle(data: any) {
  const secret = process.env.INGEST_SECRET;
  const siteUrl = getCrawlerIngestSiteBaseUrl();

  if (!secret) {
    throw new Error("❌ Missing INGEST_SECRET environment variable.");
  }

  const ingestPath =
    process.env.CRAWLER_INGEST_PATH?.trim() || '/api/articles/ingest';

  console.log(`📡 Sending data to ${siteUrl}${ingestPath}...`);

  const base = siteUrl.replace(/\/+$/, '');
  const path = ingestPath.startsWith('/') ? ingestPath : `/${ingestPath}`;
  const res = await fetchWithRetry(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-secret": secret, // 🔐 Validation Secret (lowercase to match API)
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ingest API Error: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  console.log(`✅ Server Response: ${json.message || 'Success'}`);
  return json;
}
