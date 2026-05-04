/**
 * docs/Codcompass 爬虫系统 2.0 · 1.1「断点续爬」：
 * CrawlTasks（调度）、RawMaterials（原始 JSON/HTML）、SyncLogs（加工与推送状态）。
 */
import type Database from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { createHash } from 'crypto';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export type CrawlTaskRow = {
  id: string;
  url: string;
  source: string;
  external_id: string | null;
  status: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export function taskIdFromUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

export function fingerprintText(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

export function openCrawlerDb(): Database.Database {
  const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dataDir = join(pkgRoot, 'data');
  mkdirSync(dataDir, { recursive: true });
  const dbPath = process.env.CRAWLER_SQLITE_PATH?.trim() || join(dataDir, 'crawler-state.sqlite');
  const db = new BetterSqlite3(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS crawl_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'devto',
      external_id TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_crawl_tasks_status ON crawl_tasks(status);

    CREATE TABLE IF NOT EXISTS raw_materials (
      task_id TEXT PRIMARY KEY NOT NULL REFERENCES crawl_tasks(id) ON DELETE CASCADE,
      raw_body TEXT NOT NULL,
      fingerprint TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL REFERENCES crawl_tasks(id) ON DELETE CASCADE,
      processed_content TEXT,
      classification_json TEXT,
      simhash TEXT,
      sync_status TEXT NOT NULL DEFAULT 'NOT_SYNCED',
      remote_id TEXT,
      score INTEGER,
      ingest_payload_json TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sync_logs_task ON sync_logs(task_id);
    CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(sync_status);
  `);

  console.log('[本地 SQLite]', dbPath);
  return db;
}

/** 登记待抓取 URL（文档：任务初始化 INSERT OR IGNORE） */
export function upsertPendingTask(
  db: Database.Database,
  row: { url: string; source: string; externalId: string }
): void {
  const id = taskIdFromUrl(row.url);
  db.prepare(
    `INSERT OR IGNORE INTO crawl_tasks (id, url, source, external_id, status, updated_at)
     VALUES (?, ?, ?, ?, 'PENDING', datetime('now'))`
  ).run(id, row.url, row.source, row.externalId);
}

/**
 * 待处理队列：PENDING，或已落 Raw 但尚未产生任意 sync_logs（可断点续加工）。
 */
export function listResolvableTasks(db: Database.Database, limit: number): CrawlTaskRow[] {
  return db
    .prepare(
      `SELECT c.id, c.url, c.source, c.external_id, c.status, c.retry_count, c.last_error, c.created_at, c.updated_at
       FROM crawl_tasks c
       WHERE c.retry_count < 4
         AND c.status NOT IN ('COMPLETED', 'IGNORED', 'FAILED')
         AND (
           c.status = 'PENDING'
           OR (c.status = 'CRAWLED' AND NOT EXISTS (SELECT 1 FROM sync_logs s WHERE s.task_id = c.id))
         )
       ORDER BY c.created_at ASC
       LIMIT ?`
    )
    .all(limit) as CrawlTaskRow[];
}

export function bumpRetry(db: Database.Database, taskId: string, err: string): void {
  db.prepare(
    `UPDATE crawl_tasks
     SET retry_count = retry_count + 1,
         last_error = ?,
         updated_at = datetime('now'),
         status = CASE WHEN retry_count + 1 >= 3 THEN 'FAILED' ELSE status END
     WHERE id = ?`
  ).run(err.slice(0, 2000), taskId);
}

export function markTaskStatus(db: Database.Database, taskId: string, status: string, lastError?: string | null): void {
  db.prepare(
    `UPDATE crawl_tasks SET status = ?, last_error = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, lastError ?? null, taskId);
}

export function saveRawMaterial(db: Database.Database, taskId: string, rawBody: string): void {
  const fp = fingerprintText(rawBody);
  db.prepare(
    `INSERT INTO raw_materials (task_id, raw_body, fingerprint, created_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(task_id) DO UPDATE SET raw_body = excluded.raw_body, fingerprint = excluded.fingerprint`
  ).run(taskId, rawBody, fp);
}

export function markTaskCrawled(db: Database.Database, taskId: string): void {
  markTaskStatus(db, taskId, 'CRAWLED', null);
}

export function getRawBody(db: Database.Database, taskId: string): string | undefined {
  const row = db.prepare('SELECT raw_body FROM raw_materials WHERE task_id = ?').get(taskId) as
    | { raw_body: string }
    | undefined;
  return row?.raw_body;
}

export function insertSyncLog(db: Database.Database, row: {
  task_id: string;
  processed_content: string | null;
  classification_json: string | null;
  simhash: string | null;
  sync_status: string;
  remote_id?: string | null;
  score?: number | null;
  ingest_payload_json?: string | null;
  note?: string | null;
}): void {
  db.prepare(
    `INSERT INTO sync_logs (task_id, processed_content, classification_json, simhash, sync_status, remote_id, score, ingest_payload_json, note, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    row.task_id,
    row.processed_content,
    row.classification_json,
    row.simhash,
    row.sync_status,
    row.remote_id ?? null,
    row.score ?? null,
    row.ingest_payload_json ?? null,
    row.note ?? null
  );
}
