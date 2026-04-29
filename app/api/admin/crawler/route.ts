import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// 爬虫运行状态
let isRunning = false;
let lastRunStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
let lastRunOutput = '';
let lastRunTime: string | null = null;

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

    // 爬虫脚本路径
    const scriptPath = path.join(process.cwd(), 'automation/crawler/src/run.ts');

    // 使用 tsx 运行爬虫脚本
    const child = spawn('npx', ['tsx', scriptPath], {
      env: {
        ...process.env,
        // 确保有这些环境变量
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';

    child.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      output += text;
      console.log('[Crawler]', text.trim());
    });

    child.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      errorOutput += text;
      console.error('[Crawler Error]', text.trim());
    });

    child.on('close', (code) => {
      isRunning = false;
      lastRunStatus = code === 0 ? 'success' : 'error';
      lastRunOutput = output || errorOutput;
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
      message: 'Crawler started successfully. Check console output for progress.',
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

export async function GET() {
  return NextResponse.json({
    isRunning,
    lastRunStatus,
    lastRunTime,
    lastRunOutput: lastRunOutput.slice(-2000), // 只返回最后 2000 字符
    message: 'Use POST to trigger the crawler.',
  });
}
