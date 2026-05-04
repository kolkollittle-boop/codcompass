import { existsSync } from 'fs';
import { join } from 'path';

/** 与 automation/crawler 内 openCrawlerDb 默认路径一致（仓库根运行时）。 */
export function resolveCrawlerSqlitePath(): string {
  const env = process.env.CRAWLER_SQLITE_PATH?.trim();
  if (env) return env;
  return join(process.cwd(), 'automation', 'crawler', 'data', 'crawler-state.sqlite');
}

export function crawlerSqliteExists(): boolean {
  return existsSync(resolveCrawlerSqlitePath());
}
