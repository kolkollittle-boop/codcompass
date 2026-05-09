/**
 * 检查 CRAWLED 状态的任务是否已经有 sync_logs 记录
 */
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../automation/crawler/data/crawler-state.sqlite');
const db = new Database(dbPath);

console.log('检查数据库:', dbPath);

// 检查 CRAWLED 状态的任务
const crawledTasks = db.prepare(`
  SELECT c.id, c.url, c.source, c.status, c.retry_count, c.last_error, c.created_at,
         CASE WHEN EXISTS (SELECT 1 FROM sync_logs s WHERE s.task_id = c.id) THEN 'YES' ELSE 'NO' END as has_sync_log
  FROM crawl_tasks c
  WHERE c.status = 'CRAWLED'
  ORDER BY c.created_at DESC
`).all() as any[];

console.log('\n=== CRAWLED 状态的任务 ===');
console.log(`找到 ${crawledTasks.length} 个 CRAWLED 任务:`);
console.table(crawledTasks.map(t => ({
  id: t.id,
  source: t.source,
  has_sync_log: t.has_sync_log,
  retry_count: t.retry_count,
  created_at: t.created_at,
  url: t.url.substring(0, 60) + '...'
})));

// 检查所有非终态任务
const nonTerminalTasks = db.prepare(`
  SELECT c.id, c.url, c.source, c.status, c.retry_count,
         CASE WHEN EXISTS (SELECT 1 FROM sync_logs s WHERE s.task_id = c.id) THEN 'YES' ELSE 'NO' END as has_sync_log
  FROM crawl_tasks c
  WHERE c.status NOT IN ('COMPLETED', 'IGNORED', 'FAILED')
  ORDER BY c.status, c.created_at DESC
`).all() as any[];

console.log('\n=== 所有非终态任务 ===');
console.log(`找到 ${nonTerminalTasks.length} 个非终态任务:`);
console.table(nonTerminalTasks.map(t => ({
  id: t.id,
  source: t.source,
  status: t.status,
  has_sync_log: t.has_sync_log,
  retry_count: t.retry_count,
  url: t.url.substring(0, 60) + '...'
})));

// 模拟 listResolvableTasks 查询
const resolvableTasks = db.prepare(`
  SELECT c.id, c.url, c.source, c.status, c.retry_count
  FROM crawl_tasks c
  WHERE c.retry_count < 4
    AND c.status NOT IN ('COMPLETED', 'IGNORED', 'FAILED')
    AND (
      c.status = 'PENDING'
      OR (c.status = 'CRAWLED' AND NOT EXISTS (SELECT 1 FROM sync_logs s WHERE s.task_id = c.id))
    )
  ORDER BY c.created_at ASC
  LIMIT ?
`).all(100) as any[];

console.log('\n=== listResolvableTasks() 返回结果 ===');
console.log(`可处理任务数: ${resolvableTasks.length}`);
if (resolvableTasks.length > 0) {
  console.table(resolvableTasks.map(t => ({
    id: t.id,
    source: t.source,
    status: t.status,
    retry_count: t.retry_count,
    url: t.url.substring(0, 60) + '...'
  })));
} else {
  console.log('没有可处理的任务（所有任务都处于终态或已有 sync_logs）');
}

db.close();
