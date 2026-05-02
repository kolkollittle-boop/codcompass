/**
 * 环境变量（Vercel / 本地）：
 * - GITHUB_TOKEN：PAT，需 `workflow` 权限以触发 workflow_dispatch
 * - GITHUB_REPO 或 GITHUB_REPOSITORY：owner/repo
 * - CRAWLER_WORKFLOW_FILE（可选）：默认 crawler.yml
 * - GITHUB_DEFAULT_BRANCH（可选）：默认 main
 *
 * 未配置 GITHUB_* 时仍会写入 CrawlerJob（status=queued_no_dispatch），供后续 worker 消费。
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type CrawlerJobRow = {
  id: string;
  status: string;
  triggerSource: string;
  dispatchTarget: string | null;
  githubRunUrl: string | null;
  githubRunId: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const GITHUB_API = 'https://api.github.com';

function getRepo(): { owner: string; repo: string } | null {
  const raw =
    process.env.GITHUB_REPO?.trim() ||
    process.env.GITHUB_REPOSITORY?.trim() ||
    '';
  if (!raw.includes('/')) return null;
  const [owner, repo] = raw.split('/').map((s) => s.trim());
  if (!owner || !repo) return null;
  return { owner, repo };
}

/**
 * 写入 CrawlerJob，并尝试触发 GitHub Actions（仅等待 HTTP 响应，通常 1–3 秒，带超时上限）。
 * 不执行爬虫本体，避免 Vercel Serverless 超时与子进程问题。
 */
export async function enqueueAndDispatchCrawler(
  supabase: SupabaseClient,
  options: { triggerSource?: string; githubDispatchTimeoutMs?: number } = {}
): Promise<{
  jobId: string;
  status: string;
  dispatchTarget: string | null;
  githubAccepted: boolean;
  actionsUrl: string | null;
  errorMessage: string | null;
  message: string;
}> {
  const triggerSource = options.triggerSource ?? 'admin';
  const timeoutMs = options.githubDispatchTimeoutMs ?? 12_000;
  const jobId = crypto.randomUUID();
  const workflowFile = process.env.CRAWLER_WORKFLOW_FILE?.trim() || 'crawler.yml';
  const branch = process.env.GITHUB_DEFAULT_BRANCH?.trim() || 'main';

  const repo = getRepo();
  const token = process.env.GITHUB_TOKEN?.trim();
  const actionsUrl = repo
    ? `https://github.com/${repo.owner}/${repo.repo}/actions/workflows/${workflowFile}`
    : null;

  const { error: insertError } = await supabase.from('CrawlerJob').insert({
    id: jobId,
    status: 'queued',
    triggerSource,
    dispatchTarget: null,
    githubRunUrl: null,
    githubRunId: null,
    errorMessage: null,
    metadata: {},
    updatedAt: new Date().toISOString(),
  });

  if (insertError) {
    throw new Error(`CrawlerJob insert failed: ${insertError.message}`);
  }

  if (!repo || !token) {
    const msg =
      '任务已入队，但未配置 GITHUB_TOKEN + GITHUB_REPO（owner/repo），未调用 GitHub。请在 Supabase 执行 scripts/create-crawler-job-table.sql 后配置环境变量，或由 worker 消费队列。';
    await supabase
      .from('CrawlerJob')
      .update({
        status: 'queued_no_dispatch',
        dispatchTarget: null,
        errorMessage: 'Missing GITHUB_TOKEN or GITHUB_REPO',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', jobId);

    return {
      jobId,
      status: 'queued_no_dispatch',
      dispatchTarget: null,
      githubAccepted: false,
      actionsUrl,
      errorMessage: 'Missing GITHUB_TOKEN or GITHUB_REPO',
      message: msg,
    };
  }

  await supabase
    .from('CrawlerJob')
    .update({
      status: 'dispatching',
      dispatchTarget: 'github_actions',
      updatedAt: new Date().toISOString(),
    })
    .eq('id', jobId);

  const dispatchUrl = `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  let githubAccepted = false;
  let ghError: string | null = null;

  try {
    const res = await fetch(dispatchUrl, {
      method: 'POST',
      signal: ac.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: branch,
        inputs: {
          job_id: jobId,
          triggered_by: triggerSource,
        },
      }),
    });

    if (res.status === 204 || res.status === 200) {
      githubAccepted = true;
    } else {
      const text = await res.text().catch(() => '');
      ghError = `GitHub ${res.status}: ${text.slice(0, 500)}`;
    }
  } catch (e: unknown) {
    ghError = e instanceof Error ? e.message : String(e);
  } finally {
    clearTimeout(timer);
  }

  if (githubAccepted) {
    await supabase
      .from('CrawlerJob')
      .update({
        status: 'dispatched',
        dispatchTarget: 'github_actions',
        metadata: { workflowFile, branch },
        updatedAt: new Date().toISOString(),
      })
      .eq('id', jobId);

    return {
      jobId,
      status: 'dispatched',
      dispatchTarget: 'github_actions',
      githubAccepted: true,
      actionsUrl,
      errorMessage: null,
      message:
        '已写入队列表并触发 GitHub Actions；实际抓取在云端执行，请到 Actions 查看日志。本接口不等待爬虫结束。',
    };
  }

  await supabase
    .from('CrawlerJob')
    .update({
      status: 'dispatch_failed',
      dispatchTarget: 'github_actions',
      errorMessage: ghError,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', jobId);

  return {
    jobId,
    status: 'dispatch_failed',
    dispatchTarget: 'github_actions',
    githubAccepted: false,
    actionsUrl,
    errorMessage: ghError,
    message: `任务已入队，但 GitHub 派发失败：${ghError}`,
  };
}
