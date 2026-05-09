/**
 * 检查 SQLite 中各数据源的任务数量
 * 用法: npx tsx scripts/check-crawl-tasks-by-source.ts
 */
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'automation', 'crawler');
const dbPath = join(pkgRoot, 'data', 'crawler-state.sqlite');

console.log('检查数据库:', dbPath);

const db = new Database(dbPath);

// 1. 按数据源统计 crawl_tasks
console.log('\n=== crawl_tasks 按数据源统计 ===');
const sourceStats = db.prepare(`
  SELECT source, status, COUNT(*) as count
  FROM crawl_tasks
  GROUP BY source, status
  ORDER BY source, status
`).all();

console.table(sourceStats);

// 2. 统计 sync_logs 按任务来源
console.log('\n=== sync_logs 按数据源统计 ===');
const syncBySource = db.prepare(`
  SELECT c.source, s.sync_status, COUNT(*) as count
  FROM sync_logs s
  JOIN crawl_tasks c ON s.task_id = c.id
  GROUP BY c.source, s.sync_status
  ORDER BY c.source, s.sync_status
`).all();

console.table(syncBySource);

// 3. 显示非 Dev.to 的最近 sync_logs
console.log('\n=== 非 Dev.to 最近的 sync_logs ===');
const nonDevtoLogs = db.prepare(`
  SELECT s.created_at, c.source, s.sync_status, s.score, s.note,
         SUBSTR(c.url, 1, 80) as url_preview
  FROM sync_logs s
  JOIN crawl_tasks c ON s.task_id = c.id
  WHERE c.source != 'Dev.to（默认 tag 包）'
  ORDER BY s.created_at DESC
  LIMIT 20
`).all();

if (nonDevtoLogs.length === 0) {
  console.log('没有找到非 Dev.to 的 sync_logs 记录');
} else {
  console.table(nonDevtoLogs);
}

// 4. 检查 raw_materials 中非 Dev.to 文章
console.log('\n=== raw_materials 非 Dev.to 文章 ===');
const rawNonDevto = db.prepare(`
  SELECT c.source, SUBSTR(c.url, 1, 80) as url_preview
  FROM raw_materials r
  JOIN crawl_tasks c ON r.task_id = c.id
  WHERE c.source != 'Dev.to（默认 tag 包）'
  LIMIT 20
`).all();

if (rawNonDevto.length === 0) {
  console.log('没有找到非 Dev.to 的 raw_materials');
} else {
  console.log(`找到 ${rawNonDevto.length} 条非 Dev.to 的原始内容:`);
  console.table(rawNonDevto);
}

db.close();
