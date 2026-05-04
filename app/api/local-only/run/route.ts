import { spawn } from 'child_process';
import { join } from 'path';
import { mergeLastRun, readCrawlerUiConfig, writeCrawlerUiConfig } from '@/lib/crawler-ui-config';
import {
  assertLocalCrawlerUiEnabled,
  authorizeLocalCrawlerApi,
} from '@/lib/local-crawler-ui-guard';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const TAIL = 8000;

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function tail(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(-n);
}

export async function POST(req: Request) {
  try {
    assertLocalCrawlerUiEnabled();
  } catch {
    return jsonError('Not found', 404);
  }
  if (!authorizeLocalCrawlerApi(req)) {
    return jsonError('Unauthorized', 401);
  }

  const started = Date.now();
  const cwd = join(process.cwd(), 'automation', 'crawler');
  const child = spawn('npx', ['tsx', 'src/run.ts'], {
    cwd,
    env: { ...process.env },
    shell: process.platform === 'win32',
  });

  let stdout = '';
  let stderr = '';
  child.stdout?.on('data', (d: Buffer) => {
    stdout += d.toString();
    if (stdout.length > 256 * 1024) stdout = tail(stdout, 128 * 1024);
  });
  child.stderr?.on('data', (d: Buffer) => {
    stderr += d.toString();
    if (stderr.length > 256 * 1024) stderr = tail(stderr, 128 * 1024);
  });

  const exitCode: number | null = await new Promise((resolve) => {
    child.on('close', (code) => resolve(code));
    child.on('error', () => resolve(null));
  });

  const cfg = readCrawlerUiConfig();
  const updated = mergeLastRun(cfg, {
    at: new Date().toISOString(),
    exitCode,
    stdoutTail: tail(stdout, TAIL),
    stderrTail: tail(stderr, TAIL),
    durationMs: Date.now() - started,
  });
  writeCrawlerUiConfig(updated);

  return NextResponse.json({
    ok: exitCode === 0,
    exitCode,
    stdoutTail: tail(stdout, TAIL),
    stderrTail: tail(stderr, TAIL),
  });
}
