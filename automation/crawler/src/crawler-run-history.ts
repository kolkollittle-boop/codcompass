/**
 * 爬虫单次运行摘要（供 /local-only「运行记录」与 CLI 共用），持久化 JSON。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export type CrawlerRunHistoryEntry = {
  startedAt: string;
  endedAt: string;
  siteLabel: string;
  /** 本轮从 Dev.to 等发现并入队的新任务数 */
  discovered: number;
  /** 本轮从队列取出并执行 processDbTask 的次数 */
  processed: number;
  /** AI 评分 ≥ 阈值（进入语义路由及后续）的任务数 */
  qualified: number;
  /** 成功调用 Ingest 且路由为 KB 的次数 */
  kbPushed: number;
  /** 成功调用 Ingest 且路由为 BLOG 的次数 */
  blogPushed: number;
  exitCode: number | null;
};

const MAX_STORED = 120;

export function resolveCrawlerRunHistoryPath(): string {
  const cwd = process.cwd();
  if (existsSync(join(cwd, 'src', 'run.ts'))) {
    return join(cwd, 'data', 'crawler-run-history.json');
  }
  if (existsSync(join(cwd, 'automation', 'crawler', 'src', 'run.ts'))) {
    return join(cwd, 'automation', 'crawler', 'data', 'crawler-run-history.json');
  }
  return join(cwd, 'automation', 'crawler', 'data', 'crawler-run-history.json');
}

export function readCrawlerRunHistory(limit: number): CrawlerRunHistoryEntry[] {
  const p = resolveCrawlerRunHistoryPath();
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, 'utf-8')) as unknown;
    if (!Array.isArray(raw)) return [];
    const lim = Math.min(100, Math.max(1, Math.floor(limit)));
    return (raw as CrawlerRunHistoryEntry[]).slice(-lim).reverse();
  } catch {
    return [];
  }
}

export function appendCrawlerRunHistory(entry: CrawlerRunHistoryEntry): void {
  const p = resolveCrawlerRunHistoryPath();
  mkdirSync(dirname(p), { recursive: true });
  let arr: CrawlerRunHistoryEntry[] = [];
  if (existsSync(p)) {
    try {
      const raw = JSON.parse(readFileSync(p, 'utf-8')) as unknown;
      if (Array.isArray(raw)) arr = raw as CrawlerRunHistoryEntry[];
    } catch {
      /* ignore */
    }
  }
  arr.push(entry);
  const trimmed = arr.slice(-MAX_STORED);
  writeFileSync(p, JSON.stringify(trimmed, null, 2), 'utf-8');
}
