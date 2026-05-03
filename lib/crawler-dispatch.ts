/**
 * Environment variables (Vercel / local):
 * - GITHUB_TOKEN: PAT with `workflow` scope to trigger workflow_dispatch
 * - GITHUB_REPO or GITHUB_REPOSITORY: owner/repo
 * - CRAWLER_WORKFLOW_FILE (optional): defaults to crawler.yml
 * - GITHUB_DEFAULT_BRANCH (optional): defaults to main
 *
 * If GITHUB_* is not set, a CrawlerJob is still written (status=queued_no_dispatch) for a worker to consume.
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
 * Inserts CrawlerJob and attempts to trigger GitHub Actions (waits for HTTP only, typically 1–3s, with a timeout cap).
 * Does not run the crawler process (avoids serverless timeouts and child processes).
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
      'Job queued, but GITHUB_TOKEN + GITHUB_REPO (owner/repo) are not configured—GitHub was not called. After running scripts/create-crawler-job-table.sql in Supabase, set the env vars or have a worker consume the queue.';
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
        'Job recorded and GitHub Actions triggered; crawling runs in the cloud—check Actions for logs. This API does not wait for the crawl to finish.',
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
    message: `Job queued, but GitHub dispatch failed: ${ghError}`,
  };
}
