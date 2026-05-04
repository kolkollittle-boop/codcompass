import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { resolveCrawlerSqlitePath } from '@/lib/crawler-sqlite-path';

export type CrawlLocalLibraryRow = {
  syncLogId: number;
  taskId: string;
  url: string;
  source: string;
  taskStatus: string;
  score: number | null;
  syncStatus: string;
  note: string | null;
  title: string | null;
  routeType: string | null;
  createdAt: string;
};

function parsePayload(json: string | null): { title: string | null; articleType: string | null } {
  if (!json) return { title: null, articleType: null };
  try {
    const o = JSON.parse(json) as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title : null;
    const articleType =
      typeof o.articleType === 'string'
        ? o.articleType
        : typeof o.article_type === 'string'
          ? o.article_type
          : null;
    return { title, articleType };
  } catch {
    return { title: null, articleType: null };
  }
}

function parseRouteType(classificationJson: string | null): string | null {
  if (!classificationJson) return null;
  try {
    const o = JSON.parse(classificationJson) as { route?: { type?: string } };
    const t = o.route?.type;
    return typeof t === 'string' ? t : null;
  } catch {
    return null;
  }
}

/**
 * 每条任务取最新一条 sync_logs（加工/评分/推送状态），供本地库面板查询。
 */
export function listCrawlLocalLibrary(options: {
  limit: number;
  offset: number;
  q?: string;
  status?: string;
}): { rows: CrawlLocalLibraryRow[]; total: number } {
  const dbPath = resolveCrawlerSqlitePath();
  if (!existsSync(dbPath)) {
    return { rows: [], total: 0 };
  }

  const parts = [`s.id IN (SELECT MAX(id) FROM sync_logs GROUP BY task_id)`];
  const params: unknown[] = [];

  const q = options.q?.trim();
  if (q) {
    const like = `%${q}%`;
    parts.push(
      `(t.url LIKE ? OR COALESCE(s.ingest_payload_json,'') LIKE ? OR COALESCE(s.classification_json,'') LIKE ?)`
    );
    params.push(like, like, like);
  }

  const st = options.status?.trim();
  if (st) {
    parts.push('s.sync_status = ?');
    params.push(st);
  }

  const where = parts.join(' AND ');
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });

  try {
    const countRow = db
      .prepare(
        `SELECT COUNT(*) AS c
         FROM sync_logs s
         JOIN crawl_tasks t ON t.id = s.task_id
         WHERE ${where}`
      )
      .get(...params) as { c: number };
    const total = Number(countRow?.c) || 0;

    const lim = Math.min(200, Math.max(1, options.limit));
    const off = Math.max(0, options.offset);

    const raw = db
      .prepare(
        `SELECT s.id AS syncLogId, s.task_id AS taskId, t.url, t.source, t.status AS taskStatus,
                s.score, s.sync_status AS syncStatus, s.note,
                s.ingest_payload_json AS payload, s.classification_json AS classification,
                s.created_at AS createdAt
         FROM sync_logs s
         JOIN crawl_tasks t ON t.id = s.task_id
         WHERE ${where}
         ORDER BY datetime(s.created_at) DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, lim, off) as Array<{
      syncLogId: number;
      taskId: string;
      url: string;
      source: string;
      taskStatus: string;
      score: number | null;
      syncStatus: string;
      note: string | null;
      payload: string | null;
      classification: string | null;
      createdAt: string;
    }>;

    const rows: CrawlLocalLibraryRow[] = raw.map((r) => {
      const { title, articleType } = parsePayload(r.payload);
      const routeType = articleType || parseRouteType(r.classification);
      return {
        syncLogId: r.syncLogId,
        taskId: r.taskId,
        url: r.url,
        source: r.source,
        taskStatus: r.taskStatus,
        score: r.score,
        syncStatus: r.syncStatus,
        note: r.note,
        title,
        routeType,
        createdAt: r.createdAt,
      };
    });

    return { rows, total };
  } finally {
    db.close();
  }
}
