/**
 * 将 data/pending-push/*.json 批量 POST 到正式 ingest（评分已在生成文件时达标）。
 *
 *   cd automation/crawler && npx tsx src/push-pending.ts
 */
import dotenv from 'dotenv';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ingestArticle } from './ingest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(root, '..', '..', '.env.local') });
dotenv.config({ path: join(process.cwd(), '.env.local') });

const dir = process.env.CRAWLER_PENDING_PUSH_DIR || join(root, 'data', 'pending-push');

type PendingFile = {
  payload?: Record<string, unknown>;
};

async function main() {
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  } catch {
    console.error('目录不存在或不可读:', dir);
    process.exit(1);
    return;
  }

  if (files.length === 0) {
    console.log('没有待推送文件:', dir);
    return;
  }

  for (const f of files) {
    const full = join(dir, f);
    try {
      const raw = JSON.parse(readFileSync(full, 'utf-8')) as PendingFile & { sourceUrl?: string };
      const payload = raw.payload;
      if (!payload || typeof payload !== 'object') {
        console.warn('跳过（无 payload）:', f);
        continue;
      }
      console.log('推送:', raw.sourceUrl ?? f);
      await ingestArticle(payload);
      unlinkSync(full);
      console.log('  ✓ 已推送并删除', f);
    } catch (e) {
      console.error('  ✗', f, e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
