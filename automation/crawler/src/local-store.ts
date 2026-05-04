/**
 * 爬虫结果落地本地（不入库前的审计副本 / 低分归档）。
 * 目录默认：automation/crawler/data/local-outbox/
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTBOX = process.env.CRAWLER_LOCAL_OUTBOX || join(root, 'data', 'local-outbox');
const PENDING = process.env.CRAWLER_PENDING_PUSH_DIR || join(root, 'data', 'pending-push');

function safeName(url: string): string {
  const h = Buffer.from(url).toString('base64url').slice(0, 48);
  return h;
}

export type LocalCrawlerRecord = {
  savedAt: string;
  sourceUrl: string;
  title: string;
  score: number | null;
  threshold: number;
  eligibleForPush: boolean;
  pushed: boolean;
  evaluation: Record<string, unknown> | null;
  markdownExcerpt: string;
  note?: string;
  /** 评分达标且完成流水线后的完整 ingest 载荷（用于仅本地模式稍后推送） */
  ingestPayload?: Record<string, unknown>;
};

export function saveLocalOutbox(record: LocalCrawlerRecord): string {
  const day = record.savedAt.slice(0, 10);
  const dir = join(OUTBOX, day);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${safeName(record.sourceUrl)}.json`);
  writeFileSync(file, JSON.stringify(record, null, 2), 'utf-8');
  return file;
}

export function savePendingPush(sourceUrl: string, payload: Record<string, unknown>): string {
  mkdirSync(PENDING, { recursive: true });
  const file = join(PENDING, `${safeName(sourceUrl)}.json`);
  writeFileSync(
    file,
    JSON.stringify({ savedAt: new Date().toISOString(), sourceUrl, payload }, null, 2),
    'utf-8'
  );
  return file;
}
