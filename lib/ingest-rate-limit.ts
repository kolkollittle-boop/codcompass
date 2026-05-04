/**
 * 方案 4.4：内部 Ingest 简易速率限制（内存窗口），防止本地并发打满数据库。
 */
const buckets = new Map<string, number[]>();

export function consumeIngestRateLimit(secretKey: string, count = 1): boolean {
  const windowMs = Number(process.env.INGEST_RATE_LIMIT_WINDOW_MS ?? 60_000);
  const max = Number(process.env.INGEST_RATE_LIMIT_MAX ?? 60);
  const now = Date.now();
  const cutoff = now - windowMs;
  const key = secretKey.slice(0, 32);
  const stamps = (buckets.get(key) || []).filter((t) => t > cutoff);
  for (let i = 0; i < count; i++) stamps.push(now);
  buckets.set(key, stamps);
  return stamps.length <= max;
}
