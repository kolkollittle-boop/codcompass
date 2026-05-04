/**
 * 方案 3：推送前拉取云端 SimHash 列表，在本地做 Hamming 预检。
 */
import { hammingDistanceHex } from './simhash';

export async function fetchRemoteSimhashList(
  siteUrl: string,
  secret: string,
  limit = 800
): Promise<string[]> {
  const url = `${siteUrl.replace(/\/+$/, '')}/api/articles/ingest/simhashes?limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Ingest-Secret': secret,
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`simhashes HTTP ${res.status}: ${t}`);
  }
  const json = (await res.json()) as { simhashes?: string[] };
  return Array.isArray(json.simhashes) ? json.simhashes : [];
}

export function remoteSimhashConflict(localHex: string, remoteList: string[]): boolean {
  if (!localHex || localHex.length < 16) return false;
  for (const r of remoteList) {
    if (r && r.length >= 16 && hammingDistanceHex(localHex, r) < 10) return true;
  }
  return false;
}
