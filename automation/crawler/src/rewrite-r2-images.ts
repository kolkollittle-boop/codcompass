/**
 * 将 Markdown 中的外链图片下载后上传到 R2，并替换为 R2_PUBLIC_BASE_URL 下的地址。
 */
import { createHash } from 'crypto';
import { isR2UploadEnabled, publicObjectUrl, uploadBufferToR2 } from './r2-upload';

const IMG_IN_MD = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

function extFromUrl(url: string): string {
  try {
    const p = new URL(url).pathname;
    const m = p.match(/\.([a-zA-Z0-9]+)$/);
    return (m?.[1] || 'bin').toLowerCase().replace('jpeg', 'jpg');
  } catch {
    return 'bin';
  }
}

function extFromContentType(ct: string | null): string | null {
  if (!ct) return null;
  const t = ct.split(';')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return map[t] || null;
}

const MAX_BYTES = Number(process.env.R2_IMAGE_MAX_BYTES ?? 5 * 1024 * 1024);

function isAlreadyOnCdn(url: string): boolean {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '');
  if (!base) return false;
  return url.startsWith(base + '/') || url === base;
}

/**
 * @param markdown  改写后的 Markdown
 * @param namespace 用于对象键前缀隔离（如 task id）
 * @returns 替换后的 markdown 与 原 URL → CDN URL 映射
 */
export async function rewriteMarkdownImagesToR2(
  markdown: string,
  namespace: string
): Promise<{ markdown: string; urlMap: Record<string, string> }> {
  if (!isR2UploadEnabled()) {
    return { markdown, urlMap: {} };
  }

  const urlMap: Record<string, string> = {};
  const unique = new Set<string>();
  for (const m of markdown.matchAll(IMG_IN_MD)) {
    unique.add(m[2]);
  }

  const day = new Date().toISOString().slice(0, 10);
  const ns = namespace.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'task';

  for (const srcUrl of unique) {
    if (isAlreadyOnCdn(srcUrl)) continue;
    if (srcUrl.startsWith('data:')) continue;

    try {
      const res = await fetch(srcUrl, {
        headers: {
          Accept: 'image/*,*/*;q=0.8',
          'User-Agent': 'CodcompassKB/1.0 (image mirror)',
        },
      });
      if (!res.ok) {
        console.warn(`[R2] skip (HTTP ${res.status}):`, srcUrl.slice(0, 80));
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAX_BYTES) {
        console.warn(`[R2] skip (too large ${buf.length}):`, srcUrl.slice(0, 80));
        continue;
      }
      const ct = res.headers.get('content-type');
      const ext = extFromContentType(ct) || extFromUrl(srcUrl);
      const hash = createHash('sha256').update(srcUrl).digest('hex').slice(0, 20);
      const objectKey = `crawler/${day}/${ns}-${hash}.${ext}`;
      const mime = ct?.split(';')[0].trim() || `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      await uploadBufferToR2(objectKey, buf, mime);
      const cdnUrl = publicObjectUrl(objectKey);
      urlMap[srcUrl] = cdnUrl;
      console.log(`[R2] ↑ ${objectKey}`);
    } catch (e) {
      console.warn('[R2] upload failed:', srcUrl.slice(0, 80), e);
    }
  }

  let out = markdown;
  for (const [from, to] of Object.entries(urlMap)) {
    out = out.split(from).join(to);
  }

  return { markdown: out, urlMap };
}
