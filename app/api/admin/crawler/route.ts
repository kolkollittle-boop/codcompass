import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { createRequire } from 'node:module';
import fs from 'fs';
import path from 'path';

function resolveTsxCli(): string | null {
  try {
    const require = createRequire(import.meta.url);
    return require.resolve('tsx/dist/cli.mjs');
  } catch {
    const fallback = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
    return fs.existsSync(fallback) ? fallback : null;
  }
}

// 爬虫运行状态
let isRunning = false;
let lastRunStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
let lastRunOutput = '';
let lastRunTime: string | null = null;
let currentLog: string[] = [];

export async function POST(req: NextRequest) {
  try {
    if (isRunning) {
      return NextResponse.json(
        { error: 'Crawler is already running. Please wait for it to finish.' },
        { status: 409 }
      );
    }

    isRunning = true;
    lastRunStatus = 'running';
    lastRunOutput = '';
    lastRunTime = new Date().toISOString();
    currentLog = [];

    // 爬虫脚本路径
    const scriptPath = path.join(process.cwd(), 'automation/crawler/src/run.ts');
    const tsxCli = resolveTsxCli();
    if (!tsxCli) {
      isRunning = false;
      lastRunStatus = 'error';
      lastRunOutput =
        'Local tsx not found (node_modules/tsx). Ensure "tsx" is in dependencies and redeploy.';
      return NextResponse.json(
        {
          error:
            'Crawler runtime missing: install tsx as a production dependency and redeploy.',
        },
        { status: 500 }
      );
    }

    // 勿用 npx：Serverless（如 Vercel）上 HOME 常指向不存在的路径，npx 拉包会 ENOENT。
    const tmpHome = path.join('/tmp', 'codcompass-crawler');
    try {
      fs.mkdirSync(tmpHome, { recursive: true });
    } catch {
      /* ignore */
    }

    const child = spawn(process.execPath, [tsxCli, scriptPath], {
      env: {
        ...process.env,
        HOME: tmpHome,
        TMPDIR: '/tmp',
        npm_config_cache: path.join(tmpHome, 'npm-cache'),
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      currentLog.push(text);
      lastRunOutput += text;
      console.log('[Crawler]', text.trim());
    });

    child.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      currentLog.push(text);
      lastRunOutput += text;
      console.error('[Crawler Error]', text.trim());
    });

    child.on('close', (code) => {
      isRunning = false;
      lastRunStatus = code === 0 ? 'success' : 'error';
      console.log(`[Crawler] Process exited with code ${code}`);
    });

    child.on('error', (err) => {
      isRunning = false;
      lastRunStatus = 'error';
      lastRunOutput = err.message;
      console.error('[Crawler] Failed to start:', err.message);
    });

    return NextResponse.json({
      success: true,
      message: 'Crawler started successfully.',
      pid: child.pid,
    });
  } catch (error: any) {
    isRunning = false;
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// SSE 流式日志输出
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stream = searchParams.get('stream');

  if (stream === 'true') {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // 发送当前状态
        const sendState = () => {
          const data = JSON.stringify({
            isRunning,
            status: lastRunStatus,
            log: currentLog.join(''),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        sendState();

        // 每 500ms 发送一次更新
        const interval = setInterval(() => {
          sendState();
          if (!isRunning) {
            clearInterval(interval);
            controller.close();
          }
        }, 500);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // 普通 GET 请求返回状态
  return NextResponse.json({
    isRunning,
    lastRunStatus,
    lastRunTime,
    lastRunOutput: lastRunOutput.slice(-5000),
    message: 'Use POST to trigger the crawler, or GET?stream=true for SSE log stream.',
  });
}
