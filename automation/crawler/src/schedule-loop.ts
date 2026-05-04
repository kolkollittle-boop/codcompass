/**
 * 按 crawler-ui-config.json 中的 schedule（intervalUnit + intervalValue）循环执行爬虫。
 * 用法：仓库根目录 npm run crawler:schedule（或 cd automation/crawler && npx tsx src/schedule-loop.ts）
 * 每轮结束后重新读取配置，修改间隔无需重启进程。
 */
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getScheduleIntervalMs, readCrawlerUiConfig } from './crawler-ui-config.js';

const thisFile = fileURLToPath(import.meta.url);
const crawlerRoot = join(dirname(thisFile), '..');

function intervalHuman(): string {
  const s = readCrawlerUiConfig().schedule;
  const u = s.intervalUnit ?? 'hours';
  const v =
    typeof s.intervalValue === 'number' ? s.intervalValue : s.intervalHours ?? 6;
  if (u === 'minutes') return `${v} 分钟`;
  if (u === 'days') return `${v} 天`;
  return `${v} 小时`;
}

function runOnce(): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['tsx', 'src/run.ts'], {
      cwd: crawlerRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('close', (code) => resolve(code));
    child.on('error', (err) => reject(err));
  });
}

async function main(): Promise<void> {
  console.log('[crawler:schedule] 工作目录', crawlerRoot);
  console.log('[crawler:schedule] Ctrl+C 退出；间隔从 crawler-ui-config.json 读取\n');

  for (;;) {
    console.log(
      `[crawler:schedule] ${new Date().toISOString()} 开始一轮（间隔 ${intervalHuman()}）`
    );
    try {
      const code = await runOnce();
      console.log(`[crawler:schedule] 本轮结束 exit=${code}`);
    } catch (e) {
      console.error('[crawler:schedule] 本轮异常', e);
    }
    const wait = getScheduleIntervalMs();
    console.log(`[crawler:schedule] 等待 ${Math.round(wait / 1000)}s 后下一轮…\n`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
